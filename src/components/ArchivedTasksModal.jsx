// Arquivo: src/components/ArchivedTasksModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import api from '../services/api';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '700px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--cor-borda-bloco)', borderRadius: '8px', padding: '0', overflow: 'hidden' }, overlay: { backgroundColor: 'rgba(18, 18, 18, 0.75)', zIndex: 1000 } };

function ArchivedTasksModal({ isOpen, onRequestClose, sector, onTasksUpdate }) {
    const [archivedTasks, setArchivedTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchArchivedTasks = async () => {
        if (!sector) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/setores/${sector.id}/tarefas/arquivadas`);
            setArchivedTasks(response.data);
        } catch (error) {
            toast.error("Falha ao carregar tarefas arquivadas.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchArchivedTasks();
        }
    }, [isOpen, sector]);

    const handleUnarchive = async (taskId) => {
        try {
            await api.put(`/tarefas/${taskId}/unarchive`);
            toast.success("Tarefa restaurada para o quadro!");
            fetchArchivedTasks(); // Atualiza a lista de arquivados
            onTasksUpdate();    // Atualiza o dashboard principal
        } catch (error) {
            toast.error("Falha ao restaurar a tarefa.");
        }
    };

    const handlePermanentDelete = async (taskId) => {
        if (window.confirm("Esta ação é PERMANENTE e não pode ser desfeita. Deseja continuar?")) {
            try {
                await api.delete(`/tarefas/${taskId}/permanent`);
                toast.success("Tarefa deletada permanentemente.");
                fetchArchivedTasks(); // Apenas atualiza esta lista
            } catch (error) {
                toast.error("Falha ao deletar a tarefa.");
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Tarefas Arquivadas">
            <div className="settings-modal-header">
                <h2>Tarefas Arquivadas: {sector?.nome}</h2>
            </div>
            <div className="settings-modal-content" style={{ flexGrow: 1, overflowY: 'auto' }}>
                {isLoading ? (
                    <div className="loading-center"><ClipLoader color={"var(--cor-primaria)"} size={40} /></div>
                ) : (
                    archivedTasks.length > 0 ? (
                        <table className="archived-tasks-table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Responsável</th>
                                    <th>Data Prevista</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {archivedTasks.map(task => (
                                    <tr key={task.id}>
                                        <td>{task.descricao}</td>
                                        <td>{task.responsavel_nome || 'N/A'}</td>
                                        <td>{task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toLocaleDateString('pt-BR') : 'N/A'}</td>
                                        <td className="actions-cell">
                                            <button onClick={() => handleUnarchive(task.id)} className="btn btn-success">Restaurar</button>
                                            <button onClick={() => handlePermanentDelete(task.id)} className="btn btn-danger">Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="empty-state">Nenhuma tarefa arquivada neste setor.</p>
                    )
                )}
            </div>
            <div className="settings-modal-footer">
                <button className="btn btn-secondary" onClick={onRequestClose}>Fechar</button>
            </div>
        </Modal>
    );
}

export default ArchivedTasksModal;