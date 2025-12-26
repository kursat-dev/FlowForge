import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

interface Props {
    onSelect: (workflow: any) => void;
    currentId?: string;
}

function WorkflowList({ onSelect, currentId }: Props) {
    const [workflows, setWorkflows] = useState<any[]>([]);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const res = await fetch(`${API_URL}/workflows`);
            const data = await res.json();
            setWorkflows(data);
        } catch (error) {
            console.error('Failed to fetch workflows', error);
        }
    };

    const deleteWorkflow = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Delete this workflow?')) return;

        try {
            await fetch(`${API_URL}/workflows/${id}`, { method: 'DELETE' });
            fetchWorkflows();
        } catch (error) {
            alert('Failed to delete workflow');
        }
    };

    return (
        <aside className="workflow-list">
            <h3>📋 Workflows</h3>
            <div className="workflow-items">
                {workflows.map((wf) => (
                    <div
                        key={wf.id}
                        className={`workflow-item ${wf.id === currentId ? 'active' : ''}`}
                        onClick={() => onSelect(wf)}
                    >
                        <div className="workflow-name">{wf.name}</div>
                        <button
                            className="delete-btn"
                            onClick={(e) => deleteWorkflow(wf.id, e)}
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </aside>
    );
}

export default WorkflowList;
