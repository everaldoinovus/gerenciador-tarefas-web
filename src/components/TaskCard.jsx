// Arquivo: src/components/TaskCard.jsx

import React from 'react';
// MUDANÇA: Importando da biblioteca correta e compatível
import { Draggable } from '@hello-pangea/dnd';

function TaskCard({ task, index, onCardClick, onUpdateStatus }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };
  const handleSelectClick = (e) => { e.stopPropagation(); };
  
  return (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card clickable ${snapshot.isDragging ? 'is-dragging' : ''}`}
          onClick={() => onCardClick(task)}
        >
          <div className="task-info">
            <strong>{task.descricao}</strong>
            <p>Responsável: {task.responsavel}</p>
            <p>Data de Conclusão: {formatDate(task.data_prevista_conclusao)}</p>
          </div>
          <select 
            value={task.status} 
            onChange={(e) => {
              e.stopPropagation();
              onUpdateStatus(task.id, e.target.value);
            }}
            onClick={handleSelectClick}
            className="status-select"
          >
            <option value="Pendente">Pendente</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluída">Concluída</option>
          </select>
        </li>
      )}
    </Draggable>
  );
}

export default TaskCard;