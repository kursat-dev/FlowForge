import { Router } from 'express';
import { prisma } from '@flowforge/db';
import { Queue } from 'bullmq';

const router = Router();

const workflowQueue = new Queue('workflow-execution', {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
});

// Get all workflows
router.get('/', async (req, res) => {
    try {
        const workflows = await prisma.workflow.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(workflows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workflows' });
    }
});

// Get single workflow
router.get('/:id', async (req, res) => {
    try {
        const workflow = await prisma.workflow.findUnique({
            where: { id: req.params.id },
            include: {
                executions: {
                    orderBy: { startedAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }
        res.json(workflow);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch workflow' });
    }
});

// Create workflow
router.post('/', async (req, res) => {
    try {
        const { name, description, nodes, edges } = req.body;
        const workflow = await prisma.workflow.create({
            data: {
                name,
                description,
                nodes: nodes || [],
                edges: edges || [],
            },
        });
        res.status(201).json(workflow);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

// Update workflow
router.put('/:id', async (req, res) => {
    try {
        const { name, description, nodes, edges, isActive } = req.body;
        const workflow = await prisma.workflow.update({
            where: { id: req.params.id },
            data: {
                name,
                description,
                nodes,
                edges,
                isActive,
            },
        });
        res.json(workflow);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update workflow' });
    }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
    try {
        await prisma.workflow.delete({
            where: { id: req.params.id },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete workflow' });
    }
});

// Trigger workflow manually
router.post('/:id/trigger', async (req, res) => {
    try {
        const workflow = await prisma.workflow.findUnique({
            where: { id: req.params.id },
        });

        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        const execution = await prisma.execution.create({
            data: {
                workflowId: workflow.id,
                status: 'pending',
                triggerData: req.body,
            },
        });

        // Add to queue
        await workflowQueue.add('execute', {
            workflowId: workflow.id,
            executionId: execution.id,
            triggerData: req.body,
        });

        res.status(201).json(execution);
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger workflow' });
    }
});

export default router;
