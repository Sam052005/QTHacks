import { Router } from 'express';
import { DebugService } from '../services/debugService.js';
import type { Breakpoint } from '../services/debugService.js';

const router = Router();
const debugService = new DebugService();

// Rewind/step-back the simulation state
router.post('/:id/debug/step-back', async (req, res) => {
    try {
        const { steps } = req.body;
        const result = await debugService.stepBack(req.params.id, steps || 1);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Continue simulation until breakpoint
router.post('/:id/debug/continue', async (req, res) => {
    try {
        const { breakpoints, maxCycles } = req.body;
        const bp: Breakpoint[] = breakpoints || [];
        const result = await debugService.continueUntil(req.params.id, bp, maxCycles || 20);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
