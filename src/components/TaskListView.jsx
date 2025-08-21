import React from 'react';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
};

function TaskListView({ tasks, onCardClick }) {
    if (tasks.length === 0) {
        return <p className="empty-state">Nenhuma tarefa encontrada para este setor.</p>;
    }

    return (
        <div className="task-list-view">
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Status Atual</th>
                        <th>Responsável</th>
                        <th>Data Prevista</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map(task => (
                        <tr key={task.id} onClick={() => onCardClick(task)} title="Clique para ver detalhes">
                            <td>
                                <div className="task-desc-cell">
                                  <span className={`status-indicator-dot status-${task.status_id}`}></span>
                                  {task.descricao}
                                </div>
                            </td>
                            <td><span className="status-tag">{task.status_nome}</span></td>
                            <td>{task.responsavel_nome || task.responsavel_email || 'Ninguém'}</td>
                            <td>{formatDate(task.data_prevista_conclusao)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TaskListView;