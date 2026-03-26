import prisma from '../db.js';
import { SimulationService } from './simulationService.js';

const simulationService = new SimulationService();

// All challenge IDs and their verification metadata live in the DB testCases JSON
export class ChallengeService {
  async getAllChallenges() {
    return prisma.challenge.findMany();
  }

  async getChallengeById(id: string) {
    return prisma.challenge.findUnique({ where: { id } });
  }

  async verifyChallenge(challengeId: string, simulationId: string): Promise<{ success: boolean; score: number; message: string; details: Record<string, any> }> {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    const simulation = await simulationService.getSimulation(simulationId);

    if (!challenge || !simulation) {
      return { success: false, score: 0, message: 'Challenge or simulation not found.', details: {} };
    }

    let testCriteria: Record<string, any> = {};
    try {
      testCriteria = JSON.parse(challenge.testCases);
    } catch {
      return { success: false, score: 0, message: 'Challenge criteria malformed.', details: {} };
    }

    const analysis = await simulationService.getAnalysis(simulationId);
    const details: Record<string, any> = {};
    let score = 0;
    let maxScore = 0;

    // ── CRITERION 1: Circuit Type ─────────────────────────────────────
    if (testCriteria.circuitType) {
      maxScore += 40;
      const circuitMatch = simulation.circuitType.toLowerCase().replace(/[- ]/g, '') ===
        testCriteria.circuitType.toLowerCase().replace(/[- ]/g, '');
      details.circuitType = { expected: testCriteria.circuitType, actual: simulation.circuitType, passed: circuitMatch };
      if (circuitMatch) score += 40;
    }

    // ── CRITERION 2: Flip-Flop Count ─────────────────────────────────
    if (testCriteria.numFlipFlops) {
      maxScore += 20;
      const ffMatch = simulation.numFlipFlops >= testCriteria.numFlipFlops;
      details.numFlipFlops = { expected: testCriteria.numFlipFlops, actual: simulation.numFlipFlops, passed: ffMatch };
      if (ffMatch) score += 20;
    }

    // ── CRITERION 3: Unique States ────────────────────────────────────
    if (testCriteria.minUniqueStates) {
      maxScore += 30;
      const uniqueStates = analysis?.uniqueStatesCount ?? 0;
      const statePass = uniqueStates >= testCriteria.minUniqueStates;
      details.uniqueStates = { expected: testCriteria.minUniqueStates, actual: uniqueStates, passed: statePass };
      if (statePass) score += 30;
    }

    // ── CRITERION 4: Expected Bit Pattern ────────────────────────────
    if (testCriteria.expectedPattern) {
      maxScore += 30;
      // Build a concatenated output history from timing data
      const outputHistory = simulation.timingData
        .map(t => { try { return JSON.parse(t.outputs).join(''); } catch { return ''; } })
        .join('');
      const patternFound = outputHistory.includes(testCriteria.expectedPattern);
      details.patternDetected = { expected: testCriteria.expectedPattern, found: patternFound, passed: patternFound };
      if (patternFound) score += 30;
    }

    // Minimum data: at least 4 cycles must have run
    if (!simulation.timingData || simulation.timingData.length < 4) {
      return {
        success: false, score: 0,
        message: '⚠️ Run at least 4 clock cycles before submitting.',
        details
      };
    }

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const success = percentage >= 80;

    return {
      success,
      score: percentage,
      message: success
        ? `✅ Challenge passed! You scored ${percentage}% — great work!`
        : `❌ Score: ${percentage}%. Review the failing criteria and try again.`,
      details
    };
  }
}
