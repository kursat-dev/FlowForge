import { useState, useCallback, useEffect } from 'react';
import ReactFlow, {
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Node,
    Edge,
    NodeChange,
    EdgeChange,
    Connection,
    BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Sidebar from './components/Sidebar';
import NodePropertiesPanel from './components/NodePropertiesPanel';
import WorkflowList from './components/WorkflowList';
import './App.css';

const API_URL = 'http://localhost:3000/api';

function App() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
    const [showWorkflowList, setShowWorkflowList] = useState(true);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const onNodeClick = useCallback((_: any, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            const position = {
                x: event.clientX - 250,
                y: event.clientY - 100,
            };

            const newNode: Node = {
                id: `${type}-${Date.now()}`,
                type: 'default',
                position,
                data: {
                    label: type.replace('-', ' ').toUpperCase(),
                    nodeType: type,
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        []
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const saveWorkflow = async () => {
        const workflowData = {
            name: currentWorkflow?.name || 'New Workflow',
            description: currentWorkflow?.description || '',
            nodes,
            edges,
        };

        try {
            if (currentWorkflow?.id) {
                await fetch(`${API_URL}/workflows/${currentWorkflow.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workflowData),
                });
                alert('Workflow updated!');
            } else {
                const res = await fetch(`${API_URL}/workflows`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(workflowData),
                });
                const newWorkflow = await res.json();
                setCurrentWorkflow(newWorkflow);
                alert('Workflow created!');
            }
        } catch (error) {
            alert('Failed to save workflow');
        }
    };

    const loadWorkflow = (workflow: any) => {
        setCurrentWorkflow(workflow);
        setNodes(workflow.nodes || []);
        setEdges(workflow.edges || []);
        setShowWorkflowList(false);
    };

    const newWorkflow = () => {
        setCurrentWorkflow(null);
        setNodes([]);
        setEdges([]);
        setShowWorkflowList(false);
    };

    const triggerWorkflow = async () => {
        if (!currentWorkflow?.id) {
            alert('Please save the workflow first');
            return;
        }

        try {
            await fetch(`${API_URL}/workflows/${currentWorkflow.id}/trigger`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ manual: true }),
            });
            alert('Workflow triggered!');
        } catch (error) {
            alert('Failed to trigger workflow');
        }
    };

    return (
        <div className="app">
            <header className="app-header">
                <h1>⚡ FlowForge</h1>
                <div className="header-actions">
                    <button onClick={() => setShowWorkflowList(!showWorkflowList)}>
                        {showWorkflowList ? 'Hide' : 'Show'} Workflows
                    </button>
                    <button onClick={newWorkflow}>New Workflow</button>
                    <button onClick={saveWorkflow} className="btn-primary">Save</button>
                    <button onClick={triggerWorkflow} className="btn-success">▶ Run</button>
                </div>
            </header>

            <div className="app-body">
                {showWorkflowList && (
                    <WorkflowList onSelect={loadWorkflow} currentId={currentWorkflow?.id} />
                )}

                <Sidebar />

                <div className="canvas-container" onDrop={onDrop} onDragOver={onDragOver}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        onPaneClick={onPaneClick}
                        fitView
                    >
                        <Background variant={BackgroundVariant.Dots} />
                        <Controls />
                    </ReactFlow>
                </div>

                {selectedNode && (
                    <NodePropertiesPanel
                        node={selectedNode}
                        onClose={() => setSelectedNode(null)}
                        onUpdate={(updatedNode) => {
                            setNodes((nds) =>
                                nds.map((n) => (n.id === updatedNode.id ? updatedNode : n))
                            );
                            setSelectedNode(updatedNode);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default App;
