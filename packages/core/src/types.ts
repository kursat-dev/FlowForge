export type NodeType = 'webhook' | 'http-request' | 'send-email' | 'condition' | 'postgres-query' | 'cron';

export interface NodeData {
    label?: string;
    [key: string]: any;
}

export interface Node {
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data: NodeData;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    type?: string;
}

export interface Workflow {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
    created_at: Date;
    updated_at: Date;
}

export interface ExecutionContext {
    workflowId: string;
    executionId: string;
    triggerData: any;
    steps: Record<string, any>; // NodeID -> Output
}

export interface JobData {
    workflowId: string;
    triggerData: any;
}
