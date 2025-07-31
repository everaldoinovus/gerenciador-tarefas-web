// Arquivo: gerenciador-tarefas-web/src/components/TaskCard.jsx

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

function TaskCard({ task, index, onCardClick, isDragDisabled = false }) {
  
  // A prop 'onUpdateStatus' não é mais necessária aqui, pois a mudança de status
  // por drag-and-drop é gerenciada pelo BoardView, e a edição manual pelo TaskDetailModal.

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };
  
  // O conteúdo interno do card, agora sem o <select>
  const CardInnerContent = () => (
    <div className="task-info">
      <strong>{task.descricao}</strong>
      <p>Responsável: {task.responsavel_email || 'Ninguém'}</p>
      <p>Data de Conclusão: {formatDate(task.data_prevista_conclusao)}</p>
    </div>
  );

  // Se o drag and drop estiver desabilitado (modo lista), renderiza um 'li' simples
  if (isDragDisabled) {
    return (
      <li className="task-card clickable" onClick={() => onCardClick(task)}>
        <CardInnerContent />
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
          <CardInnerContent />
        </li>
      )}
    </Draggable>
  );
}

export default TaskCard;