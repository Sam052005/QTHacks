import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticate } from './authRoutes.js';
import { ChatService } from '../services/chatService.js';

const router = Router();

router.post('/message', authenticate, async (req: Request, res: Response): Promise<void> => {
  const { projectId, message, context } = req.body;
  if (!projectId) {
    res.status(400).json({ error: 'Project ID is required to maintain memory.' });
    return;
  }
  if (!message) {
    res.status(400).json({ error: 'Message is required.' });
    return;
  }

  try {
    const reply = await ChatService.processMessage(projectId, message, context);
    res.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to process AI chat.' });
  }
});

router.get('/history/:projectId', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }
    const messages = await ChatService.getHistory(projectId);
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve chat history.' });
  }
});

export default router;
