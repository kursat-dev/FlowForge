import { Node } from 'reactflow';
import { useState } from 'react';

interface Props {
    node: Node;
    onClose: () => void;
    onUpdate: (node: Node) => void;
}

function NodePropertiesPanel({ node, onClose, onUpdate }: Props) {
    const [label, setLabel] = useState(node.data.label || '');

    const handleSave = () => {
        onUpdate({
            ...node,
            data: { ...node.data, label },
        });
    };

    return (
        <aside className="properties-panel">
            <div className="panel-header">
                <h3>⚙️ Node Properties</h3>
                <button onClick={onClose}>✕</button>
            </div>
            <div className="panel-body">
                <label>
                    Label:
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                    />
                </label>
                <button onClick={handleSave} className="btn-save">
                    Save
                </button>
            </div>
        </aside>
    );
}

export default NodePropertiesPanel;
