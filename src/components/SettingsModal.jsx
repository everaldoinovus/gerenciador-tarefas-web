// Arquivo: gerenciador-tarefas-web/src/components/SettingsModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '550px', border: '1px solid #ccc', borderRadius: '8px', padding: '0', overflow: 'hidden' }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } };
Modal.setAppElement('#root');

function SettingsModal({ isOpen, onRequestClose, sector }) {
    const [activeTab, setActiveTab] = useState('members');
    
    // Estados para a aba de Membros
    const [members, setMembers] = useState([]);
    const [emailToInvite, setEmailToInvite] = useState('');

    // (Estados para a aba de Status virão depois)

    // Função para buscar os membros atuais do setor
    const fetchMembers = async () => {
        if (!sector) return;
        try {
            const response = await api.get(`/setores/${sector.id}/membros`);
            setMembers(response.data);
        } catch (error) {
            toast.error("Não foi possível carregar os membros do setor.");
        }
    };

    // Busca os dados relevantes para a aba ativa sempre que o modal abrir ou a aba mudar
    useEffect(() => {
        if (isOpen && sector) {
            if (activeTab === 'members') {
                fetchMembers();
            }
            // (Lógica para buscar status virá aqui)
        }
    }, [isOpen, sector, activeTab]);

    // Função para enviar um convite
    const handleInvite = async (e) => {
        e.preventDefault();
        if (!emailToInvite.trim() || !sector) return;
        try {
            await api.post(`/setores/${sector.id}/convidar`, { email: emailToInvite });
            toast.success(`Convite enviado para ${emailToInvite}!`);
            setEmailToInvite('');
            // Futuramente, podemos adicionar o convite a uma lista de "pendentes" na UI
        } catch (error) {
            toast.error(error.response?.data?.error || "Falha ao enviar convite.");
        }
    };
    
    if (!sector) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Configurações do Setor">
            <div className="settings-modal-header">
                <h2>Configurações - {sector.nome}</h2>
                <div className="tabs">
                    <button onClick={() => setActiveTab('members')} className={activeTab === 'members' ? 'active' : ''}>Membros</button>
                    <button onClick={() => setActiveTab('statuses')} className={activeTab === 'statuses' ? 'active' : ''}>Colunas / Status</button>
                </div>
            </div>
            <div className="settings-modal-content">
                {activeTab === 'members' ? (
                    <div className="members-tab">
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
                            <ul className="members-list">
                                {members.map(member => (
                                    <li key={member.id}>
                                        <span>{member.email}</span>
                                        <span className="member-role">{member.funcao}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="statuses-tab">
                        <h4>Gerenciar Colunas / Status</h4>
                        <p>(A interface para adicionar, renomear e deletar status aparecerá aqui.)</p>
                    </div>
                )}
            </div>
            <div className="settings-modal-footer">
                <button onClick={onRequestClose} className="close-modal-btn">Fechar</button>
            </div>
        </Modal>
    );
}

export default SettingsModal;