// Arquivo: src/components/TaskFilter.jsx

function TaskFilter({ onFilterChange }) {
  return (
    <div className="task-filter">
      <h3>Filtrar Tarefas</h3>
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Filtrar por responsável..."
          onChange={(e) => onFilterChange('responsavel', e.target.value)}
        />
        <input
          type="date"
          onChange={(e) => onFilterChange('data', e.target.value)}
        />
      </div>
    </div>
  );
}

export default TaskFilter;