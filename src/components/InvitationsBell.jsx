import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

function InvitationsBell({ onAcceptInvitation }) {
  const [invitations, setInvitations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Função para buscar os convites pendentes
  const fetchInvitations = async () => {
    try {
      const response = await api.get('/convites');
      setInvitations(response.data);
    } catch (error) {
      console.error("Erro ao buscar convites:", error);
    }
  };

  // Busca os convites quando o componente é montado
  useEffect(() => {
    fetchInvitations();
  }, []);

  // Função para aceitar um convite
  const handleAccept = async (conviteId) => {
    try {
      await api.post(`/convites/${conviteId}/aceitar`);
      toast.success("Convite aceito com sucesso!");
      
      // Remove o convite da lista local para a UI atualizar
      setInvitations(invitations.filter(inv => inv.convite_id !== conviteId));
      
      // Avisa o DashboardPage que um convite foi aceito para ele recarregar os setores
      if (onAcceptInvitation) {
        onAcceptInvitation();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Falha ao aceitar convite.");
    }
  };

  if (invitations.length === 0) {
    return null; // Se não há convites, não mostra nada
  }

  return (
    <div className="invitations-bell-container">
      <button onClick={() => setIsOpen(!isOpen)} className="bell-button">
        🔔
        <span className="invitation-count">{invitations.length}</span>
      </button>

      {isOpen && (
        <div className="invitations-dropdown">
          <div className="dropdown-header">Você tem {invitations.length} convite(s)</div>
          <ul>
            {invitations.map(inv => (
              <li key={inv.convite_id}>
                <span>Você foi convidado para o setor <strong>{inv.setor_nome}</strong>.</span>
                <button onClick={() => handleAccept(inv.convite_id)} className="accept-btn">Aceitar</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default InvitationsBell;