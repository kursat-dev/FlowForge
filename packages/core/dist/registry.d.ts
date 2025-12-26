import { NodeType } from './types';
export interface NodeHandler {
    execute(data: any, context: any): Promise<any>;
}
export declare const nodeRegistry: Record<NodeType, NodeHandler>;
export declare function registerNode(type: NodeType, handler: NodeHandler): void;
//# sourceMappingURL=registry.d.ts.map