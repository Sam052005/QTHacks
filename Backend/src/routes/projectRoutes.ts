import { Router } from 'express';
import type { Request, Response } from 'express';
import prisma from '../db.js';
import { authenticate } from './authRoutes.js';

const router = Router();

// Create new Project workspace
router.post('/create', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, circuitType, numFlipFlops, circuitParams } = req.body;

    const project = await prisma.project.create({
      data: {
        userId,
        name: name || 'Untitled Project',
        circuitType,
        numFlipFlops,
        circuitParams: circuitParams || {}
      }
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// List user Projects
router.get('/list', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });
    
    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get specific project
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id as string;

    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.userId !== userId) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch project details' });
  }
});

// Delete specific project
router.delete('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const projectId = req.params.id as string;

    if (!projectId) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    // Verify ownership before deleting
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project || project.userId !== userId) {
      res.status(404).json({ error: 'Project not found or unauthorized' });
      return;
    }

    await prisma.project.delete({
      where: { id: projectId }
    });

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
