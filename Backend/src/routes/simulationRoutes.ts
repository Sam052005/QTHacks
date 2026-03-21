import { Router } from 'express';
import { SimulationService } from '../services/simulationService';

const router = Router();
const simulationService = new SimulationService();

// Create new simulation
router.post('/', async (req, res) => {
    try {
        const { circuitType, numFlipFlops, clockFrequency, inputSequence } = req.body;
        const simulation = await simulationService.createSimulation(
            circuitType,
            numFlipFlops,
            clockFrequency || 1.0,
            inputSequence || []
        );
        res.status(201).json(simulation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Retrieve simulation state
router.get('/:id', async (req, res) => {
    try {
        const simulation = await simulationService.getSimulation(req.params.id);
        if (!simulation) {
            return res.status(404).json({ error: 'Simulation not found' });
        }
        res.json(simulation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Update simulation
router.put('/:id', async (req, res) => {
    try {
        const simulation = await simulationService.updateSimulation(req.params.id, req.body);
        res.json(simulation);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Delete simulation
router.delete('/:id', async (req, res) => {
    try {
        await simulationService.deleteSimulation(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Execute single clock cycle
router.post('/:id/step', async (req, res) => {
    try {
        const { input } = req.body; // default 0
        const result = await simulationService.stepSimulation(req.params.id, input || 0);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Run batch simulation
router.post('/:id/run', async (req, res) => {
    try {
        const { cycles, inputs } = req.body;
        const result = await simulationService.runBatchSimulation(req.params.id, cycles || 1, inputs || []);
        res.json(result);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

// Get analytics data
router.get('/:id/analysis', async (req, res) => {
    try {
        const analysis = await simulationService.getAnalysis(req.params.id);
        res.json(analysis);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
