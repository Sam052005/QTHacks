import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import simulationRoutes from './routes/simulationRoutes';
import exportRoutes from './routes/exportRoutes';
import circuitRoutes from './routes/circuitRoutes';
import challengeRoutes from './routes/challengeRoutes';
import debugRoutes from './routes/debugRoutes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/simulations', simulationRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/circuits', circuitRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/simulations', debugRoutes); // Attached to /api/simulations/:id/debug

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
