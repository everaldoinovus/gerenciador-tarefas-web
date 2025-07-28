import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '500px', border: '1px solid #ccc', borderRadius: '8px', padding: '20px', }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } };
Modal.setAppElement('#root');

function MemberManagerModal({ isOpen, onRequestClose, sector }) {
    const [members, setMembers] = useState([]);
    const [emailToInvite, setEmailToInvite] = useState('');

    const fetchMembers = async () => { if (!sector) return; try { const response = await api.get(`/setores/${sector.id}/membros`); setMembers(response.data); } catch (error) { toast.error("Não foi possível carregar os membros do setor."); } };
    useEffect(() => { if (isOpen && sector) { fetchMembers(); } }, [isOpen, sector]);

    const handleInvite = async (e) => { e.preventDefault(); if (!emailToInvite.trim() || !sector) return; try { await api.post(`/setores/${sector.id}/convidar`, { email: emailToInvite }); toast.success(`Convite enviado para ${emailToInvite}!`); setEmailToInvite(''); } catch (error) { toast.error(error.response?.data?.error || "Falha ao enviar convite."); } };

    if (!sector) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Gerenciar Membros do Setor">
            <h2>Gerenciar Membros - {sector.nome}</h2>
            <div className="invite-section">
                <h4>Convidar Novo Membro</h4>
                <form onSubmit={handleInvite} className="invite-form"><input type="email" value={emailToInvite} onChange={(e) => setEmailToInvite(e.target.value)} placeholder="E-mail do novo membro" required /><button type="submit">Convidar</button></form>
            </div>
            <div className="members-list-section">
                <h4>Membros Atuais</h4>
                <ul className="members-list">{members.map(member => (<li key={member.id}><span>{member.email}</span><span className="member-role">{member.funcao}</span></li>))}</ul>
            </div>
            <button onClick={onRequestClose} className="close-modal-btn">Fechar</button>
        </Modal>
    );
}

export default MemberManagerModal;