import { Router } from 'express';
import { prisma } from '@flowforge/db';

const router = Router();

// Get all executions
router.get('/', async (req, res) => {
    try {
        const executions = await prisma.execution.findMany({
            orderBy: { startedAt: 'desc' },
            take: 50,
            include: {
                workflow: {
                    select: { id: true, name: true },
                },
            },
        });
        res.json(executions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch executions' });
    }
});

// Get single execution with steps
router.get('/:id', async (req, res) => {
    try {
        const execution = await prisma.execution.findUnique({
            where: { id: req.params.id },
            include: {
                workflow: true,
                steps: {
                    orderBy: { startedAt: 'asc' },
                },
            },
        });
        if (!execution) {
            return res.status(404).json({ error: 'Execution not found' });
        }
        res.json(execution);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch execution' });
    }
});

export default router;
