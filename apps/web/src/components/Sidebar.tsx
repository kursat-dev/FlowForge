const nodeTypes = [
    { type: 'webhook', label: '🔗 Webhook', color: '#3b82f6' },
    { type: 'http-request', label: '🌐 HTTP Request', color: '#10b981' },
    { type: 'send-email', label: '📧 Send Email', color: '#f59e0b' },
    { type: 'condition', label: '🔀 Condition', color: '#8b5cf6' },
    { type: 'postgres-query', label: '🗄️ Database Query', color: '#ec4899' },
];

function Sidebar() {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="sidebar">
            <h3>📦 Nodes</h3>
            <div className="node-list">
                {nodeTypes.map((node) => (
                    <div
                        key={node.type}
                        className="node-item"
                        draggable
                        onDragStart={(e) => onDragStart(e, node.type)}
                        style={{ borderLeft: `4px solid ${node.color}` }}
                    >
                        {node.label}
                    </div>
                ))}
            </div>
        </aside>
    );
}

export default Sidebar;
