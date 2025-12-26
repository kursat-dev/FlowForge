import { Workflow, ExecutionContext } from './types';

export class WorkflowEngine {
    constructor() { }

    async runWorkflow(workflow: Workflow, context: ExecutionContext) {
        console.log(`Running workflow ${workflow.id} with context`, context);
        // TODO: Graph traversal
    }
}
