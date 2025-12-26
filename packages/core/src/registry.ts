import { NodeType } from './types';

export interface NodeHandler {
    execute(data: any, context: any): Promise<any>;
}

export const nodeRegistry: Record<NodeType, NodeHandler> = {} as any;

export function registerNode(type: NodeType, handler: NodeHandler) {
    nodeRegistry[type] = handler;
}
