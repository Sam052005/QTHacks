import prisma from '../db.js';
import { SimulationService } from './simulationService.js';
import type { FlipFlopState } from '../engine/flipflops.js';

export interface Breakpoint {
    type: 'CYCLE' | 'STATE';
    target?: string; // used for STATE breakpoint e.g., 'FF1'
    value: number;   // cycle number or logic state 0/1
}

export class DebugService {
    private simulationService: SimulationService;

    constructor() {
        this.simulationService = new SimulationService();
    }

    async stepBack(simulationId: string, steps: number = 1) {
        const sim = await prisma.simulation.findUnique({
             where: { id: simulationId },
             include: { timingData: true }
        });
        if (!sim) throw new Error('Simulation not found');

        const currentCycle = sim.timingData.length;
        if (currentCycle <= steps) {
            // Rewind to beginning
            await prisma.timingPoint.deleteMany({ where: { simulationId } });
            // For FF state, we would ideally reset to initial.
            // Since SimulatorService recreates engine and relies on timing data, 
            // deleting timing points effectively resets the simulation progress.
            return { message: "Rewound to cycle 0" };
        }

        const targetCycle = currentCycle - steps;

        // Delete all timing points after the target cycle
        await prisma.timingPoint.deleteMany({
            where: {
                simulationId,
                cycle: { gt: targetCycle }
            }
        });

        return { message: `Rewound to cycle ${targetCycle}` };
    }

    async continueUntil(simulationId: string, breakpoints: Breakpoint[], maxCycles: number = 20) {
        let cyclesRun = 0;
        let hitBreakpoint: Breakpoint | null = null;

        while (cyclesRun < maxCycles) {
            // Attempt 1 step
            const simState = await this.simulationService.stepSimulation(simulationId);
            cyclesRun++;

            // Evaluate Breakpoints
            for (const bp of breakpoints) {
                if (bp.type === 'CYCLE') {
                    // +1 because simState.timingData.length implies cycle
                    const currentCycleCount = simState?.timingData.length || 0;
                    if (currentCycleCount === bp.value) {
                        hitBreakpoint = bp;
                        break;
                    }
                } else if (bp.type === 'STATE' && bp.target) {
                    const targetNodeIndex = parseInt(bp.target.replace(/\D/g, ''), 10);
                    // find latest outputs from timingData
                    if (simState && simState.timingData.length > 0) {
                        const latestPoint = simState.timingData[simState.timingData.length - 1];
                        try {
                            const outputs = JSON.parse(latestPoint.outputs);
                            if (outputs[targetNodeIndex] === bp.value) {
                                hitBreakpoint = bp;
                                break;
                            }
                        } catch(e) {}
                    }
                }
            }

            if (hitBreakpoint) break;
        }

        return {
            cyclesExecuted: cyclesRun,
            breakpointHit: hitBreakpoint,
            simulation: await this.simulationService.getSimulation(simulationId)
        };
    }
}
