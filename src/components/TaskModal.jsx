// Arquivo: gerenciador-tarefas-web/src/components/TaskModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';
import TaskForm from './TaskForm';

const customModalStyles = { /* ... (código igual) ... */ };
Modal.setAppElement('#root');

function TaskModal({ isOpen, onRequestClose, onTaskAdd, sector }) {
  const [members, setMembers] = useState([]);

  // Busca os membros do setor sempre que o modal for aberto para um novo setor
  useEffect(() => {
    const fetchMembers = async () => {
      if (!sector) return;
      try {
        const response = await api.get(`/setores/${sector.id}/membros`);
        setMembers(response.data);
      } catch (error) {
        toast.error("Não foi possível carregar a lista de responsáveis.");
      }
    };
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, sector]);
  
  const handleFormSubmit = (formData) => {
    const completeTaskData = { ...formData, setor_id: sector.id };
    onTaskAdd(completeTaskData);
    onRequestClose();
  };
  
  if (!sector) return null;

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Adicionar Nova Tarefa">
      <h2>Nova Tarefa para: {sector.nome}</h2>
      {/* Passa a lista de membros para o formulário */}
      <TaskForm onSubmit={handleFormSubmit} members={members} />
    </Modal>
  );
}

// Código completo para garantir:
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';
import TaskForm from './TaskForm';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '450px', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } };
Modal.setAppElement('#root');

function TaskModal({ isOpen, onRequestClose, onTaskAdd, sector }) {
    const [members, setMembers] = useState([]);
    useEffect(() => { const fetchMembers = async () => { if (!sector) return; try { const response = await api.get(`/setores/${sector.id}/membros`); setMembers(response.data); } catch (error) { toast.error("Não foi possível carregar a lista de responsáveis."); } }; if (isOpen) { fetchMembers(); } }, [isOpen, sector]);
    const handleFormSubmit = (formData) => { const completeTaskData = { ...formData, setor_id: sector.id }; onTaskAdd(completeTaskData); onRequestClose(); };
    if (!sector) return null;
    return (<Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Adicionar Nova Tarefa"><h2>Nova Tarefa para: {sector.nome}</h2><TaskForm onSubmit={handleFormSubmit} members={members} /></Modal>);
}

export default TaskModal;