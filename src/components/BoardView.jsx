// Arquivo: gerenciador-tarefas-web/src/components/BoardView.jsx

import React from 'react';
import TaskCard from './TaskCard';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';

function BoardView({ tasks, onCardClick, onUpdateStatus }) {
  const statuses = ['Pendente', 'Em Andamento', 'Concluída'];

  const groupedTasks = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter(task => task.status === status);
    return acc;
  }, {});

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    const newStatus = destination.droppableId;
    const taskId = parseInt(draggableId);
    onUpdateStatus(taskId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="kanban-board">
        {statuses.map(status => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                className={`kanban-column ${snapshot.isDraggingOver ? 'is-over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <h3>{status} ({groupedTasks[status].length})</h3>
                <div className="column-cards">
                  {/* CONDIÇÃO ADICIONADA AQUI */}
                  {groupedTasks[status].length === 0 ? (
                    <div className="empty-state-message">
                      <p>Nenhuma tarefa nesta coluna.</p>
                    </div>
                  ) : (
                    groupedTasks[status].map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        onCardClick={onCardClick}
                        onUpdateStatus={onUpdateStatus}
                      />
                    ))
                  )}
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