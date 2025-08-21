// Arquivo: src/components/UserProfileModal.jsx - VERSÃO COM EDIÇÃO DE NOME

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChangePasswordForm from './ChangePasswordForm';

const customModalStyles = { 
    content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '500px', border: '1px solid var(--cor-borda-bloco)', borderRadius: '8px', padding: '0', overflow: 'hidden' }, 
    overlay: { backgroundColor: 'rgba(18, 18, 18, 0.75)' } 
};

function UserProfileModal({ isOpen, onRequestClose }) {
    const { userInfo, fetchUserInfo } = useAuth(); // Usamos a nova função do contexto
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [name, setName] = useState(userInfo?.nome || '');

    // Garante que o nome no input seja atualizado se o userInfo mudar
    useEffect(() => {
        if (userInfo) {
            setName(userInfo.nome || '');
        }
    }, [userInfo]);

    const handleSaveName = async () => {
        if (!name.trim()) {
            toast.error("O nome não pode ficar em branco.");
            return;
        }
        try {
            await api.put('/users/update-profile', { nome: name });
            toast.success("Nome atualizado com sucesso!");
            await fetchUserInfo(); // Busca os dados mais recentes do usuário
            setIsEditingName(false);
        } catch (error) {
            toast.error(error.response?.data?.error || "Falha ao atualizar o nome.");
        }
    };

    if (!userInfo) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Perfil do Usuário">
            <div className="settings-modal-header">
                <h2>Meu Perfil</h2>
            </div>
            <div className="settings-modal-content">
                <div className="user-info-section">
                    <p><strong>Email:</strong> {userInfo.email}</p>
                    <div className="name-editor">
                        <strong>Nome:</strong>
                        {isEditingName ? (
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                onBlur={handleSaveName} 
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                autoFocus
                                className="name-input"
                            />
                        ) : (
                            <span className="name-display" onClick={() => setIsEditingName(true)} title="Clique para editar">
                                {userInfo.nome || 'Clique para definir seu nome'}
                                <span className="edit-icon">✏️</span>
                            </span>
                        )}
                    </div>
                    <p><strong>Papel:</strong> {userInfo.role === 'admin' ? 'Administrador' : 'Usuário'}</p>
                </div>
                
                <hr />

                <div className="change-password-section">
                    <h4>Alterar Senha</h4>
                    <ChangePasswordForm onSuccess={onRequestClose} />
                </div>
            </div>
            <div className="settings-modal-footer">
                <button className="btn btn-secondary" onClick={onRequestClose}>Fechar</button>
            </div>
        </Modal>
    );
}

export default UserProfileModal;


/*
import React from 'react'; // << CORREÇÃO APLICADA AQUI
import Modal from 'react-modal';
import { useAuth } from '../context/AuthContext';
import ChangePasswordForm from './ChangePasswordForm';

// Lembre-se de colocar seus estilos de modal aqui, ou defina-os via CSS.
// Exemplo:
const customModalStyles = { 
    content: { 
        top: '50%', 
        left: '50%', 
        right: 'auto', 
        bottom: 'auto', 
        marginRight: '-50%', 
        transform: 'translate(-50%, -50%)', 
        width: '500px', 
        border: '1px solid var(--cor-borda-bloco)', 
        borderRadius: '8px', 
        padding: '0', 
        overflow: 'hidden' 
    }, 
    overlay: { 
        backgroundColor: 'rgba(18, 18, 18, 0.75)' 
    } 
};

function UserProfileModal({ isOpen, onRequestClose }) {
    const { userInfo } = useAuth();

    if (!userInfo) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Perfil do Usuário">
            <div className="settings-modal-header">  
                <h2>Meu Perfil</h2>
            </div>
            <div className="settings-modal-content"> 
                <div className="user-info-section">
                    <strong>Email:</strong> {userInfo.email}
                    <br />
                    <strong>Papel:</strong> {userInfo.role === 'admin' ? 'Administrador' : 'Usuário'}
                </div>
                
                <hr />

                <div className="change-password-section">
                    <h4>Alterar Senha</h4>
                    <ChangePasswordForm onSuccess={onRequestClose} />
                </div>
            </div>
            <div className="settings-modal-footer"> 
                <button className="btn btn-secondary" onClick={onRequestClose}>Fechar</button>
            </div>
        </Modal>
    );
}

export default UserProfileModal;*/