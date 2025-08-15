import React from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

// ===== ÍCONE SVG CORRIGIDO E COMPLETO =====
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
    </svg>
);

function UserRow({ user, onUserUpdate }) {
    const handleRoleChange = async (e) => {
        const newRole = e.target.value;
        try {
            await api.put(`/users/${user.id}/role`, { role: newRole });
            toast.success(`Papel de ${user.email} atualizado.`);
            onUserUpdate(); // Recarrega a lista
        } catch (error) {
            toast.error("Falha ao atualizar o papel.");
        }
    };

    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        try {
            await api.put(`/users/${user.id}/status`, { status: newStatus });
            toast.success(`Status de ${user.email} atualizado.`);
            onUserUpdate();
        } catch (error) {
            toast.error("Falha ao atualizar o status.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja deletar o usuário ${user.email}? Esta ação não pode ser desfeita.`)) {
            try {
                await api.delete(`/users/${user.id}`);
                toast.success("Usuário deletado com sucesso.");
                onUserUpdate();
            } catch (error) {
                toast.error(error.response?.data?.error || "Falha ao deletar usuário.");
            }
        }
    };

    return (
        <tr>
            <td>{user.email}</td>
            <td>
                <select value={user.role} onChange={handleRoleChange} className="table-select">
                    <option value="user">Usuário</option>
                    <option value="admin">Admin</option>
                </select>
            </td>
            <td>
                <select value={user.status} onChange={handleStatusChange} className="table-select">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                </select>
            </td>
            <td>
                <button onClick={handleDelete} className="btn-icon btn-delete-rule" title="Deletar Usuário">
                    <TrashIcon />
                </button>
            </td>
        </tr>
    );
}

export default UserRow;