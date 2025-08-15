import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import api from '../services/api';

import UserRow from '../components/UserRow';
import InviteUserModal from '../components/InviteUserModal';

// Crie um novo arquivo CSS para esta página
import './UserManagementPage.css';

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            toast.error("Falha ao carregar a lista de usuários.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="user-management-page">
            <header className="page-header">
                <h1>Gerenciamento de Usuários</h1>
                <div className="header-actions">
                    <button className="btn btn-primary" onClick={() => setIsInviteModalOpen(true)}>
                        + Convidar Novo Usuário
                    </button>
                    <Link to="/app" className="btn btn-secondary">Voltar ao Dashboard</Link>
                </div>
            </header>

            <div className="content-card">
                {isLoading ? (
                    <div className="loading-center">
                        <ClipLoader color={"var(--cor-primaria)"} size={50} />
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Papel</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <UserRow key={user.id} user={user} onUserUpdate={fetchUsers} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <InviteUserModal 
                isOpen={isInviteModalOpen}
                onRequestClose={() => setIsInviteModalOpen(false)}
                onUserAdded={fetchUsers}
            />
        </div>
    );
}

export default UserManagementPage;