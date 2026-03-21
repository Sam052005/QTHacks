import prisma from '../db';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export class ExportService {
    async exportJSON(simulationId: string) {
        const sim = await prisma.simulation.findUnique({
            where: { id: simulationId },
            include: { timingData: true, states: true }
        });
        if (!sim) throw new Error('Simulation not found');
        return JSON.stringify(sim, null, 2);
    }

    async exportCSV(simulationId: string): Promise<string> {
        const sim = await prisma.simulation.findUnique({
            where: { id: simulationId },
            include: { timingData: { orderBy: { cycle: 'asc' } } }
        });
        if (!sim) throw new Error('Simulation not found');

        const exportDir = path.join(__dirname, '../../exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const filePath = path.join(exportDir, `simulation-${simulationId}.csv`);
        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: [
                { id: 'cycle', title: 'Cycle' },
                { id: 'clock', title: 'Clock' },
                { id: 'input', title: 'Input' },
                { id: 'outputs', title: 'Outputs (Q)' },
                { id: 'timestamp', title: 'Timestamp' }
            ]
        });

        const records = sim.timingData.map(t => ({
            cycle: t.cycle,
            clock: t.clock,
            input: t.input,
            outputs: t.outputs,
            timestamp: t.timestamp.toISOString()
        }));

        await csvWriter.writeRecords(records);
        return filePath;
    }
}
