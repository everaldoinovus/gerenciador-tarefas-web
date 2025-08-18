import React, 'react';
import Modal from 'react-modal';
import { useAuth } from '../context/AuthContext';
import ChangePasswordForm from './ChangePasswordForm'; // Vamos criar este a seguir

const customModalStyles = { /* Seus estilos de modal aqui */ };

function UserProfileModal({ isOpen, onRequestClose }) {
    const { userInfo } = useAuth();

    if (!userInfo) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Perfil do Usuário">
            <div className="modal-header">
                <h2>Meu Perfil</h2>
            </div>
            <div className="modal-content">
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
            <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onRequestClose}>Fechar</button>
            </div>
        </Modal>
    );
}

export default UserProfileModal;