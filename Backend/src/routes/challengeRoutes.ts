import { Router } from 'express';
import prisma from '../db.js';
import { ChallengeService } from '../services/challengeService.js';

const router = Router();
const challengeService = new ChallengeService();

router.get('/', async (req, res) => {
    try {
        const challenges = await prisma.challenge.findMany();
        res.json(challenges);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;
        const { simulationId } = req.body;
        
        if (!simulationId) {
            return res.status(400).json({ error: "simulationId is required" });
        }

        const success = await challengeService.verifyChallenge(id, simulationId);

        res.json({ success, message: success ? 'Challenge completed!' : 'Solution is not quite right yet. Keep trying!' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/:id/hint', async (req, res) => {
    try {
        const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id } });
        if (!challenge) return res.status(404).json({ error: "Challenge not found" });

        let hints = [];
        try { hints = JSON.parse(challenge.hints); } catch(e) {}

        const hint = hints.length > 0 ? hints[0] : "No hints available.";
        res.json({ hint });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
