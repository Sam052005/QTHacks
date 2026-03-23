import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import simulationRoutes from './routes/simulationRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import circuitRoutes from './routes/circuitRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import debugRoutes from './routes/debugRoutes.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
// import { connectMongo } from './config/mongo.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/simulations', simulationRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/circuits', circuitRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/simulations', debugRoutes); // Shared parent route

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
