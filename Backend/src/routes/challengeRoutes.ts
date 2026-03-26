import { Router, type Request, type Response } from 'express';
import prisma from '../db.js';
import { ChallengeService } from '../services/challengeService.js';

const router = Router();
const challengeService = new ChallengeService();

// GET all challenges
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const challenges = await challengeService.getAllChallenges();
    res.json(challenges);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single challenge
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id!;
    const challenge = await challengeService.getChallengeById(id);
    if (!challenge) { res.status(404).json({ error: 'Challenge not found' }); return; }
    res.json(challenge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST submit solution
router.post('/:id/submit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { simulationId } = req.body;
    if (!id) { res.status(400).json({ error: 'Challenge ID is required' }); return; }
    if (!simulationId) { res.status(400).json({ error: 'simulationId is required' }); return; }

    const result = await challengeService.verifyChallenge(id!, simulationId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET hints
router.get('/:id/hint', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id!;
    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) { res.status(404).json({ error: 'Challenge not found' }); return; }
    let hints: string[] = [];
    try { hints = JSON.parse(challenge.hints); } catch {}
    res.json({ hints });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
