// Arquivo: gerenciador-tarefas-web/src/components/TaskCard.jsx

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

function TaskCard({ task, index, onCardClick, onUpdateStatus, isDragDisabled = false }) {
  
  // Função para formatar a data, garantindo que a hora não afete o dia
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };
  
  // Impede que o clique no select propague para o card e abra o modal
  const handleSelectClick = (e) => {
    e.stopPropagation();
  };

  // O conteúdo interno do card, para ser reutilizado
  const CardInnerContent = () => (
    <>
      <div className="task-info">
        <strong>{task.descricao}</strong>
        <p>Responsável: {task.responsavel_email || 'Ninguém'}</p>
        <p>Data de Conclusão: {formatDate(task.data_prevista_conclusao)}</p>
      </div>
      <select 
        value={task.status} 
        onChange={(e) => { 
          e.stopPropagation(); // Impede o clique de abrir o modal
          onUpdateStatus(task.id, e.target.value);
        }}
        onClick={handleSelectClick}
        className="status-select"
      >
        <option value="Pendente">Pendente</option>
        <option value="Em Andamento">Em Andamento</option>
        <option value="Concluída">Concluída</option>
      </select>
    </>
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