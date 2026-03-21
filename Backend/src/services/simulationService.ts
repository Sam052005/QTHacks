import prisma from '../db';
import { SequentialCircuit, ShiftRegister, RingCounter, JohnsonCounter } from '../engine/circuits';

export class SimulationService {
    
    private getCircuitInstance(circuitType: string, numFlipFlops: number): SequentialCircuit {
        switch (circuitType.toUpperCase()) {
            case 'SHIFT_REGISTER': return new ShiftRegister(numFlipFlops);
            case 'RING_COUNTER': return new RingCounter(numFlipFlops);
            case 'JOHNSON_COUNTER': return new JohnsonCounter(numFlipFlops);
            default:
                throw new Error(`Unsupported circuit type: ${circuitType}`);
        }
    }

    async createSimulation(circuitType: string, numFlipFlops: number, clockFrequency: number, inputSequence: number[]) {
        // Initialize the engine to get starting state
        const engine = this.getCircuitInstance(circuitType, numFlipFlops);
        const initialState = engine.getState();

        const simulation = await prisma.$transaction(async (tx) => {
            const sim = await tx.simulation.create({
                data: {
                    circuitType,
                    numFlipFlops,
                    clockFrequency,
                    inputSequence: JSON.stringify(inputSequence)
                }
            });

            // Persist initial flip flop states
            for (const ff of initialState.flipFlops) {
                await tx.flipFlopState.create({
                    data: {
                        simulationId: sim.id,
                        type: ff.type,
                        q: ff.q,
                        qNot: ff.qNot
                    }
                });
            }

            return sim;
        });

        return this.getSimulation(simulation.id);
    }

    async getSimulation(id: string) {
        return prisma.simulation.findUnique({
            where: { id },
            include: {
                states: true,
                timingData: {
                    orderBy: { cycle: 'asc' }
                }
            }
        });
    }

    async updateSimulation(id: string, data: any) {
        return prisma.simulation.update({
            where: { id },
            data: {
                ...data,
                inputSequence: data.inputSequence ? JSON.stringify(data.inputSequence) : undefined
            }
        });
    }

    async deleteSimulation(id: string) {
        return prisma.simulation.delete({ where: { id } });
    }

    // Since we are simulating, we need to reconstruct the circuit from DB state, step it, and save back
    // To do this properly we iterate over historical states or just step standard
    // For simplicity, a true step should restore engine state, advance 1, and save.
    // Instead, since these circuits are deterministic, we can recreate the engine, fast forward to the current cycle, and do 1 step.
    private async fastForwardEngine(simId: string) {
        const sim = await this.getSimulation(simId);
        if (!sim) throw new Error('Simulation not found');

        const engine = this.getCircuitInstance(sim.circuitType, sim.numFlipFlops);
        const currentCycle = sim.timingData.length;
        
        let inputs: number[] = [];
        try {
            inputs = sim.inputSequence ? JSON.parse(sim.inputSequence) : [];
        } catch(e) {}

        if (currentCycle > 0) {
            // Re-run everything to get to current state. 
            // In a real high-perf app, we would directly inject state into the engine.
            // But this guarantees perfect consistency and is fast enough for 1000 cycles.
            engine.runBatch(currentCycle, inputs);
        }

        return { sim, engine, currentCycle, inputs };
    }

    async stepSimulation(id: string, customInput?: number) {
        const { sim, engine, currentCycle, inputs } = await this.fastForwardEngine(id);
        const inputToUse = customInput !== undefined ? customInput : (inputs[currentCycle] || 0);

        // Run 1 cycle
        const cycleStates = engine.runCycle(inputToUse as 0 | 1);
        const finalState = cycleStates[cycleStates.length - 1]; // the state after complete cycle

        await this.persistCycle(id, currentCycle + 1, finalState);
        return this.getSimulation(id);
    }

    async runBatchSimulation(id: string, cycles: number, customInputs?: number[]) {
        const { sim, engine, currentCycle, inputs } = await this.fastForwardEngine(id);
        
        const inputsToUse = customInputs && customInputs.length > 0 ? customInputs : inputs.slice(currentCycle);

        await prisma.$transaction(async (tx) => {
            const states = engine.runBatch(cycles, inputsToUse as (0 | 1)[]);
            
            // We only save the discrete clock cycles, not half-cycles, to keep timingData matched per cycle
            // runBatch returns 2 states per cycle. We take the evens or odds representing the end of the cycle.
            for (let i = 0; i < cycles; i++) {
                const finalState = states[(i * 2) + 1];
                const cycleNum = currentCycle + i + 1;
                
                // Update FF states
                await tx.flipFlopState.deleteMany({ where: { simulationId: id } });
                for (const ff of finalState.flipFlops) {
                    await tx.flipFlopState.create({
                        data: { simulationId: id, type: ff.type, q: ff.q, qNot: ff.qNot }
                    });
                }
                
                // Add timing point
                await tx.timingPoint.create({
                    data: {
                        simulationId: id,
                        cycle: cycleNum,
                        clock: finalState.clock,
                        input: finalState.input,
                        outputs: JSON.stringify(finalState.flipFlops.map(f => f.q))
                    }
                });
            }
        });

        return this.getSimulation(id);
    }

    private async persistCycle(id: string, cycleNum: number, finalState: any) {
        await prisma.$transaction([
            prisma.flipFlopState.deleteMany({ where: { simulationId: id } }),
            ...finalState.flipFlops.map((ff: any) => prisma.flipFlopState.create({
                data: { simulationId: id, type: ff.type, q: ff.q, qNot: ff.qNot }
            })),
            prisma.timingPoint.create({
                data: {
                    simulationId: id,
                    cycle: cycleNum,
                    clock: finalState.clock,
                    input: finalState.input,
                    outputs: JSON.stringify(finalState.flipFlops.map((f: any) => f.q))
                }
            })
        ]);
    }

    async getAnalysis(id: string) {
        const sim = await this.getSimulation(id);
        if (!sim || !sim.timingData) throw new Error('Simulation not found');

        const statesSeen = new Set<string>();
        let highCount = 0;
        let totalSignals = 0;

        sim.timingData.forEach(point => {
            try {
                const outputs = JSON.parse(point.outputs);
                statesSeen.add(outputs.join(''));
                
                outputs.forEach((val: number) => {
                    if (val === 1) highCount++;
                    totalSignals++;
                });
            } catch (e) {}
        });

        const frequencyHigh = totalSignals > 0 ? (highCount / totalSignals) * 100 : 0;
        const frequencyLow = 100 - frequencyHigh;

        return {
            uniqueStatesCount: statesSeen.size,
            uniqueStates: Array.from(statesSeen),
            totalCycles: sim.timingData.length,
            signalDistribution: {
                highPercentage: frequencyHigh.toFixed(2),
                lowPercentage: frequencyLow.toFixed(2)
            }
        };
    }
}
