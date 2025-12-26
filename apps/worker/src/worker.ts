import { Worker, Job } from 'bullmq';
import { prisma } from '@flowforge/db';
import axios from 'axios';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

interface JobData {
    workflowId: string;
    executionId: string;
    triggerData: any;
}

const worker = new Worker<JobData>(
    'workflow-execution',
    async (job: Job<JobData>) => {
        console.log(`Processing workflow execution ${job.data.executionId}`);

        const { workflowId, executionId, triggerData } = job.data;

        try {
            // Update execution status to running
            await prisma.execution.update({
                where: { id: executionId },
                data: { status: 'running' },
            });

            // Fetch workflow
            const workflow = await prisma.workflow.findUnique({
                where: { id: workflowId },
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            const nodes = workflow.nodes as any[];
            const edges = workflow.edges as any[];

            // Simple sequential execution (for demo)
            // In production, you'd implement proper graph traversal
            const context: Record<string, any> = { trigger: triggerData };

            for (const node of nodes) {
                const stepStart = new Date();

                try {
                    const step = await prisma.executionStep.create({
                        data: {
                            executionId,
                            nodeId: node.id,
                            nodeName: node.data.label || node.type,
                            status: 'running',
                            input: context,
                        },
                    });

                    // Execute node based on type
                    let output: any = null;

                    switch (node.data.nodeType) {
                        case 'webhook':
                            output = { message: 'Webhook triggered', data: triggerData };
                            break;

                        case 'http-request':
                            try {
                                const response = await axios.get('https://api.github.com/zen');
                                output = { data: response.data };
                            } catch (error: any) {
                                output = { error: error.message };
                            }
                            break;

                        case 'send-email':
                            output = { message: 'Email sent (simulated)', to: 'user@example.com' };
                            break;

                        case 'condition':
                            output = { result: true };
                            break;

                        case 'postgres-query':
                            output = { message: 'Query executed (simulated)' };
                            break;

                        default:
                            output = { message: 'Unknown node type' };
                    }

                    context[node.id] = output;

                    // Update step as completed
                    await prisma.executionStep.update({
                        where: { id: step.id },
                        data: {
                            status: 'completed',
                            output,
                            completedAt: new Date(),
                        },
                    });

                    console.log(`✓ Completed node ${node.id} (${node.data.nodeType})`);
                } catch (error: any) {
                    console.error(`✗ Failed node ${node.id}:`, error.message);

                    await prisma.executionStep.updateMany({
                        where: { executionId, nodeId: node.id },
                        data: {
                            status: 'failed',
                            error: error.message,
                            completedAt: new Date(),
                        },
                    });

                    throw error;
                }
            }

            // Mark execution as completed
            await prisma.execution.update({
                where: { id: executionId },
                data: {
                    status: 'completed',
                    completedAt: new Date(),
                },
            });

            console.log(`✓ Workflow execution ${executionId} completed successfully`);
        } catch (error: any) {
            console.error(`✗ Workflow execution ${executionId} failed:`, error.message);

            await prisma.execution.update({
                where: { id: executionId },
                data: {
                    status: 'failed',
                    error: error.message,
                    completedAt: new Date(),
                },
            });

            throw error;
        }
    },
    { connection }
);

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed with error: ${err.message}`);
});

console.log('🚀 Worker started and listening for jobs...');
