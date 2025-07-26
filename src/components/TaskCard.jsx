// Arquivo: gerenciador-tarefas-web/src/components/TaskCard.jsx

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

// Recebe uma nova prop: 'isDragDisabled'
function TaskCard({ task, index, onCardClick, onUpdateStatus, isDragDisabled = false }) {
  
  const formatDate = (dateString) => { /* ... */ };
  const handleSelectClick = (e) => { e.stopPropagation(); };

  // O conteúdo do card agora é um componente separado para reutilização
  const CardContent = (
    <div className="task-info">
      <strong>{task.descricao}</strong>
      <p>Responsável: {task.responsavel}</p>
      {/* ... (o resto do conteúdo do card) ... */}
    </div>
    // ... (select de status) ...
  );

  // Se o drag and drop estiver desabilitado (modo lista), renderiza um 'li' simples
  if (isDragDisabled) {
    return (
      <li className="task-card clickable" onClick={() => onCardClick(task)}>
        {/* Código do conteúdo do card duplicado para clareza, poderia ser um componente */}
        <div className="task-info">
            <strong>{task.descricao}</strong>
            <p>Responsável: {task.responsavel}</p>
            <p>Data de Conclusão: {formatDate(task.data_prevista_conclusao)}</p>
        </div>
        <select value={task.status} onChange={(e) => { e.stopPropagation(); onUpdateStatus(task.id, e.target.value); }} onClick={handleSelectClick} className="status-select">
            <option value="Pendente">Pendente</option>
            <option value="Em Andamento">Em Andamento</option>
            <option value="Concluída">Concluída</option>
        </select>
      </li>
    );
  }

  // Se estiver habilitado (modo quadro), renderiza o 'Draggable'
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
          {/* O mesmo conteúdo do card */}
          <div className="task-info">
            <strong>{task.descricao}</strong>
            <p>Responsável: {task.responsavel}</p>
            <p>Data de Conclusão: {formatDate(task.data_prevista_conclusao)}</p>
          </div>
          <select value={task.status} onChange={(e) => { e.stopPropagation(); onUpdateStatus(task.id, e.target.value); }} onClick={handleSelectClick} className="status-select">
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