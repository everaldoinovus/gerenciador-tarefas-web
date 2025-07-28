import React from 'react';
import Modal from 'react-modal';
import TaskForm from './TaskForm'; // Importamos nosso formulário simplificado

// Reutilizamos os mesmos estilos do modal de setores
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '450px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

Modal.setAppElement('#root');

// O modal recebe o setor para o qual a tarefa será criada
function TaskModal({ isOpen, onRequestClose, onTaskAdd, sector }) {
  
  // Esta função é passada para o TaskForm.
  // Ela recebe os dados do formulário e adiciona o 'setor_id' antes de continuar.
const handleFormSubmit = (formData) => {
  const completeTaskData = {
    ...formData,
    setor_id: sector.id
  };
  onTaskAdd(completeTaskData);
  onRequestClose();
};
  
  // Se o setor não foi carregado ainda, não renderiza nada para evitar erros.
  if (!sector) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customModalStyles}
      contentLabel="Adicionar Nova Tarefa"
    >
      {/* O título agora é dinâmico, mostrando o nome do setor */}
      <h2>Nova Tarefa para: {sector.nome}</h2>
      
      {/* Renderiza o formulário e passa a função de submission */}
      <TaskForm onSubmit={handleFormSubmit} />

    </Modal>
  );
}

export default TaskModal;