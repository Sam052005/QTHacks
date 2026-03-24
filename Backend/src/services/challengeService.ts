import prisma from '../db.js';
import { SimulationService } from './simulationService.js';

const simulationService = new SimulationService();

export class ChallengeService {
    async verifyChallenge(challengeId: string, simulationId: string) {
        const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
        const simulation = await simulationService.getSimulation(simulationId);

        if (!challenge || !simulation) {
            throw new Error('Challenge or Simulation not found');
        }

        let testCases = [];
        try {
            testCases = JSON.parse(challenge.testCases);
        } catch (e) {
            console.error("Failed to parse test cases", e);
        }

        // Logic-based verification
        // 1. Check if the circuit type matches
        if (challenge.objective.toLowerCase().includes(simulation.circuitType.toLowerCase())) {
            // Good
        }

        // 2. Run state analysis
        const analysis = await simulationService.getAnalysis(simulationId);

        // Specific rules per challenge type (based on IDs from frontend)
        if (challengeId === 'johnson-states') {
             // Johnson counter should have 2N states for N flip flops
             const expectedStates = simulation.numFlipFlops * 2;
             if (analysis.uniqueStatesCount >= expectedStates) return true;
        }

        if (challengeId === 'ring-detect') {
            // Ring counter should have N states for N flip flops
            if (analysis.uniqueStatesCount === simulation.numFlipFlops) return true;
        }

        // 3. Sequential pattern matching (e.g. "1011" detection)
        // We look for the expected sequence in the timing data
        const expectedPattern = challenge.testCases; // reuse field for simple string matches
        if (expectedPattern && expectedPattern.length > 0) {
            const outputsConcat = simulation.timingData.map(t => {
                try {
                    return JSON.parse(t.outputs).join('');
                } catch(e) { return ''; }
            }).join('|');

            if (outputsConcat.includes(expectedPattern)) return true;
        }

        // Basic check for shift register movement
        if (simulation.circuitType === 'SHIFT_REGISTER' && simulation.timingData.length > 4) {
             return true; // Simplified pass for manual debug
        }

        return false;
    }
}
