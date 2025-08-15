import React from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const TrashIcon = () => ( /* ... SVG da lixeira ... */ );

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