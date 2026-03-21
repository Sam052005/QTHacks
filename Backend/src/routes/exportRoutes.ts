import { Router } from 'express';
import { ExportService } from '../services/exportService';

const router = Router();
const exportService = new ExportService();

router.post('/:id/json', async (req, res) => {
    try {
        const data = await exportService.exportJSON(req.params.id);
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="simulation-${req.params.id}.json"`);
        res.send(data);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post('/:id/csv', async (req, res) => {
    try {
        const filePath = await exportService.exportCSV(req.params.id);
        res.download(filePath);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

export default router;
