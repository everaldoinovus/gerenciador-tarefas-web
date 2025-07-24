import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

// ===== ESTILOS RESTAURADOS =====
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '600px', // O tamanho que havíamos definido
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '25px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000
  }
};

Modal.setAppElement('#root');

// O resto do componente que você já tem e está funcionando
function TaskDetailModal({ isOpen, onRequestClose, task, sectors, onUpdateTask, onDeleteTask }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTask, setEditableTask] = useState(null);

  useEffect(() => {
    if (task) {
      const formattedDate = task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toISOString().split('T')[0] : '';
      setEditableTask({ ...task, data_prevista_conclusao: formattedDate });
    } else {
      setEditableTask(null);
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    onUpdateTask(editableTask.id, editableTask);
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    const formattedDate = task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toISOString().split('T')[0] : '';
    setEditableTask({ ...task, data_prevista_conclusao: formattedDate });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja deletar esta tarefa? Esta ação não pode ser desfeita.")) {
      onDeleteTask(task.id);
      onRequestClose();
    }
  };

  if (!isOpen || !editableTask) return null;

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Detalhes da Tarefa">
      {isEditing ? (
        <div className="task-modal-edit-mode">
          <input type="text" name="descricao" value={editableTask.descricao} onChange={handleChange} className="modal-title-input" />
          <div className="form-grid">
            <label>Responsável</label>
            <input type="text" name="responsavel" value={editableTask.responsavel} onChange={handleChange} />
            <label>Setor</label>
            <select name="setor_id" value={editableTask.setor_id} onChange={handleChange}>{sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select>
            <label>Status</label>
            <select name="status" value={editableTask.status} onChange={handleChange}><option value="Pendente">Pendente</option><option value="Em Andamento">Em Andamento</option><option value="Concluída">Concluída</option></select>
            <label>Data Prevista</label>
            <input type="date" name="data_prevista_conclusao" value={editableTask.data_prevista_conclusao} onChange={handleChange} />
          </div>
          <h3>Anotações</h3>
          <textarea name="notas" value={editableTask.notas || ''} onChange={handleChange} className="modal-notes-textarea"></textarea>
          <div className="modal-actions">
            <button onClick={handleSaveChanges} className="save-btn">Salvar Alterações</button>
            <button onClick={handleCancelEdit} className="cancel-btn">Cancelar</button>
          </div>
        </div>
      ) : (
        <div className="task-modal-view-mode">
          <h2>{editableTask.descricao}</h2>
          <div className="details-grid">
            <span><strong>Status:</strong> <span className={`status-${editableTask.status?.replace(' ', '-')}`}>{editableTask.status}</span></span>
            <span><strong>Responsável:</strong> {editableTask.responsavel}</span>
            <span><strong>Setor:</strong> {sectors.find(s => s.id === editableTask.setor_id)?.nome}</span>
            <span><strong>Data Prevista:</strong> {formatDateForDisplay(editableTask.data_prevista_conclusao)}</span>
          </div>
          <h3>Anotações</h3>
          <div className="notes-display">
            {editableTask.notas || 'Nenhuma anotação adicionada.'}
          </div>
          <div className="modal-actions">
            <button onClick={() => setIsEditing(true)} className="edit-btn">Editar</button>
            <button onClick={handleDelete} className="delete-btn-modal">Deletar Tarefa</button>
            <button onClick={onRequestClose} className="close-btn">Fechar</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default TaskDetailModal;