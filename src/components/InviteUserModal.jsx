import React, { useState } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const customModalStyles = { /* ... Seus estilos de modal aqui ... */ };

function InviteUserModal({ isOpen, onRequestClose, onUserAdded }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/users/invite', { email, senha });
            toast.success("Usuário convidado com sucesso!");
            onUserAdded(); // Pede para a página principal recarregar a lista de usuários
            setEmail('');
            setSenha('');
            onRequestClose();
        } catch (error) {
            toast.error(error.response?.data?.error || "Falha ao convidar usuário.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Convidar Novo Usuário">
            <div className="modal-header">
                <h2>Convidar Novo Usuário</h2>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                    <label htmlFor="invite-email">E-mail do Usuário</label>
                    <input
                        id="invite-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="invite-password">Senha Temporária</label>
                    <input
                        id="invite-password"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={onRequestClose} disabled={isLoading}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Convidando...' : 'Convidar Usuário'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default InviteUserModal;