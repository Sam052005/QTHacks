import { Router } from 'express';
import prisma from '../db';

const router = Router();

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
        const challenge = await prisma.challenge.findUnique({ where: { id: req.params.id } });
        if (!challenge) return res.status(404).json({ error: "Challenge not found" });

        // Dummy validation against expected outputs
        const isSolutionCorrect = true; // In a full implementation, run simulation vs expected

        res.json({ success: isSolutionCorrect, message: isSolutionCorrect ? 'Challenge completed!' : 'Incorrect solution.' });
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
