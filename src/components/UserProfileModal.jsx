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
            <div className="settings-modal-header">  {/* Reutilizando estilo do header de outro modal */}
                <h2>Meu Perfil</h2>
            </div>
            <div className="settings-modal-content"> {/* Reutilizando estilo do content de outro modal */}
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
            <div className="settings-modal-footer"> {/* Reutilizando estilo do footer de outro modal */}
                <button className="btn btn-secondary" onClick={onRequestClose}>Fechar</button>
            </div>
        </Modal>
    );
}

export default UserProfileModal;