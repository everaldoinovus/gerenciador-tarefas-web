// Arquivo: gerenciador-tarefas-web/src/components/BoardView.jsx

import React from 'react';
import TaskCard from './TaskCard';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

// 1. Recebe 'statuses' como uma prop, em vez de ter uma lista fixa
function BoardView({ tasks, statuses, onCardClick, onUpdateStatus }) {
  
  // Agrupa as tarefas pelo ID do status, não mais pelo nome
  const groupedTasks = statuses.reduce((acc, status) => {
    acc[status.id] = tasks.filter(task => task.status_id === status.id);
    return acc;
  }, {});

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    // O ID da coluna de destino agora é o NOVO STATUS ID
    const newStatusId = parseInt(destination.droppableId, 10);
    const taskId = parseInt(draggableId, 10);

    // Precisamos atualizar a tarefa com o novo 'status_id'
    // A função onUpdateStatus precisa ser ajustada para isso
    onUpdateStatus(taskId, { status_id: newStatusId });
  };
  


  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="kanban-board">
        {/* 2. Mapeia a lista de status recebida para criar as colunas */}
        {statuses.map(status => (
          // O ID do Droppable agora é o ID do status (um número)
          <Droppable key={status.id} droppableId={status.id.toString()}>
            {(provided, snapshot) => (
              <div
                className={`kanban-column ${snapshot.isDraggingOver ? 'is-over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {/* 3. O título da coluna é o nome do status */}
                <h3>{status.nome} ({groupedTasks[status.id]?.length || 0})</h3>
                <div className="column-cards">
                  {groupedTasks[status.id]?.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      onCardClick={onCardClick}
                      // Esta função também precisará de ajustes
                    />
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}

export default BoardView;