import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

function ChangePasswordForm({ onSuccess }) {
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmaSenha, setConfirmaSenha] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (novaSenha !== confirmaSenha) {
            toast.error("A nova senha e a confirmação não correspondem.");
            return;
        }
        
        setIsLoading(true);
        try {
            await api.put('/users/change-password', { senhaAtual, novaSenha });
            toast.success("Senha alterada com sucesso!");
            if (onSuccess) onSuccess(); // Fecha o modal em caso de sucesso
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmaSenha('');
        } catch (error) {
            toast.error(error.response?.data?.error || "Falha ao alterar a senha.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
                <label htmlFor="current-password">Senha Atual</label>
                <input id="current-password" type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="new-password">Nova Senha</label>
                <input id="new-password" type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} required />
            </div>
            <div className="form-group">
                <label htmlFor="confirm-password">Confirmar Nova Senha</label>
                <input id="confirm-password" type="password" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)} required />
            </div>
            <div className="form-actions-right">
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
            </div>
        </form>
    );
}

export default ChangePasswordForm;