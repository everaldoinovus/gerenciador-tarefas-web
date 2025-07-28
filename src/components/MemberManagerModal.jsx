import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};

Modal.setAppElement('#root');

function MemberManagerModal({ isOpen, onRequestClose, sector }) {
  const [members, setMembers] = useState([]);
  const [emailToInvite, setEmailToInvite] = useState('');

  // Função para buscar os membros atuais do setor (ainda não temos a rota, mas vamos preparar)
  const fetchMembers = async () => {
    // Lógica para buscar membros virá aqui no futuro
    // Por enquanto, podemos simular:
    // setMembers([{ id: 1, email: 'dono@exemplo.com', funcao: 'dono' }]);
  };

  useEffect(() => {
    if (isOpen && sector) {
      fetchMembers();
    }
  }, [isOpen, sector]);

  // Função para enviar um convite
  const handleInvite = async (e) => {
    e.preventDefault();
    if (!emailToInvite.trim() || !sector) return;

    try {
      // Usamos a nossa nova rota da API
      await api.post(`/setores/${sector.id}/convidar`, { email: emailToInvite });
      toast.success(`Convite enviado para ${emailToInvite}!`);
      setEmailToInvite(''); // Limpa o campo
      // Futuramente, poderíamos atualizar uma lista de "convites pendentes" aqui
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao enviar convite.");
    }
  };

  // Se o setor não foi carregado, não renderiza nada
  if (!sector) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customModalStyles}
      contentLabel="Gerenciar Membros do Setor"
    >
      <h2>Gerenciar Membros - {sector.nome}</h2>
      
      <div className="invite-section">
        <h4>Convidar Novo Membro</h4>
        <form onSubmit={handleInvite} className="invite-form">
          <input
            type="email"
            value={emailToInvite}
            onChange={(e) => setEmailToInvite(e.target.value)}
            placeholder="E-mail do novo membro"
            required
          />
          <button type="submit">Convidar</button>
        </form>
      </div>

      <div className="members-list-section">
        <h4>Membros Atuais</h4>
        <p>(A lista de membros aparecerá aqui em breve)</p>
        {/*
        <ul className="members-list">
          {members.map(member => (
            <li key={member.id}>
              <span>{member.email}</span>
              <span className="member-role">{member.funcao}</span>
            </li>
          ))}
        </ul>
        */}
      </div>
      
      <button onClick={onRequestClose} className="close-modal-btn">Fechar</button>
    </Modal>
  );
}

export default MemberManagerModal;