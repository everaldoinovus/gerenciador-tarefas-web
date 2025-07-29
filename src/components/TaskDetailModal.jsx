import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '25px', }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 } };
Modal.setAppElement('#root');

function TaskDetailModal({ isOpen, onRequestClose, task, sectors, onUpdateTask, onDeleteTask }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTask, setEditableTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [members, setMembers] = useState([]);

    useEffect(() => { const fetchDetails = async () => { if (task) { try { const [historyRes, membersRes] = await Promise.all([ api.get(`/tarefas/${task.id}/historico`), api.get(`/setores/${task.setor_id}/membros`) ]); setHistory(historyRes.data); setMembers(membersRes.data); } catch (error) { toast.error("Não foi possível carregar os detalhes da tarefa."); } } }; if (isOpen) { fetchDetails(); } }, [isOpen, task]);
    useEffect(() => { if (task) { const formattedDate = task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toISOString().split('T')[0] : ''; setEditableTask({ ...task, data_prevista_conclusao: formattedDate }); } else { setEditableTask(null); } }, [task]);

    const handleChange = (e) => { const { name, value } = e.target; setEditableTask(prev => ({ ...prev, [name]: value })); };
    
    const handleSaveChanges = async () => {
        const taskToUpdate = { ...editableTask, responsavel_id: parseInt(editableTask.responsavel_id, 10) || null };
        try {
            await onUpdateTask(taskToUpdate.id, taskToUpdate);
            onRequestClose(); // Fecha o modal após o sucesso
        } catch (error) {
            console.error("Falha ao salvar alterações:", error);
        }
    };

    const handleCancelEdit = () => { const formattedDate = task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toISOString().split('T')[0] : ''; setEditableTask({ ...task, data_prevista_conclusao: formattedDate }); setIsEditing(false); };
    const handleDelete = () => { if (window.confirm("Tem certeza?")) { onDeleteTask(task.id); onRequestClose(); } };
    const calculateDuration = (startDate, endDate) => { const start = new Date(startDate); const end = new Date(endDate); let diffMs = end - start; if (diffMs < 0) return '0m'; let duration = []; const days = Math.floor(diffMs / 86400000); if(days > 0) duration.push(`${days}d`); diffMs %= 86400000; const hours = Math.floor(diffMs / 3600000); if(hours > 0) duration.push(`${hours}h`); diffMs %= 3600000; const minutes = Math.floor(diffMs / 60000); if(minutes > 0 || duration.length === 0) duration.push(`${minutes}m`); return duration.join(' '); };
    const formatDateForDisplay = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };

    if (!isOpen || !editableTask) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Detalhes da Tarefa">
            {isEditing ? (
                <div className="task-modal-edit-mode">
                    <input type="text" name="descricao" value={editableTask.descricao} onChange={handleChange} className="modal-title-input" />
                    <div className="form-grid"><label>Responsável</label><select name="responsavel_id" value={editableTask.responsavel_id || ''} onChange={handleChange}><option value="">-- Ninguém --</option>{members.map(m => <option key={m.id} value={m.id}>{m.email}</option>)}</select><label>Setor</label><select name="setor_id" value={editableTask.setor_id} onChange={handleChange}>{sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select><label>Status</label><select name="status" value={editableTask.status} onChange={handleChange}><option value="Pendente">Pendente</option><option value="Em Andamento">Em Andamento</option><option value="Concluída">Concluída</option></select><label>Data Prevista</label><input type="date" name="data_prevista_conclusao" value={editableTask.data_prevista_conclusao} onChange={handleChange} /></div>
                    <h3>Anotações</h3><textarea name="notas" value={editableTask.notas || ''} onChange={handleChange} className="modal-notes-textarea"></textarea>
                    <div className="modal-actions"><button onClick={handleSaveChanges} className="save-btn">Salvar Alterações</button><button onClick={handleCancelEdit} className="cancel-btn">Cancelar</button></div>
                </div>
            ) : (
                <div className="task-modal-view-mode">
                    <h2>{editableTask.descricao}</h2>
                    <div className="details-grid"><span><strong>Status:</strong> <span className={`status-${editableTask.status?.replace(' ', '-')}`}>{editableTask.status}</span></span><span><strong>Responsável:</strong> {editableTask.responsavel_email || 'Ninguém'}</span><span><strong>Setor:</strong> {sectors.find(s => s.id === editableTask.setor_id)?.nome}</span><span><strong>Data Prevista:</strong> {formatDateForDisplay(editableTask.data_prevista_conclusao)}</span></div>
                    <div className="history-section"><h3>Histórico de Status</h3><ul className="history-list">{history.map((entry, index) => { const timeInPreviousStatus = index > 0 ? calculateDuration(history[index - 1].data_alteracao, entry.data_alteracao) : calculateDuration(task.data_inclusao, entry.data_alteracao); return (<li key={index}><div className="history-entry"><span>Movido para <strong>{entry.status_novo}</strong> por <em>{entry.usuario_alteracao_email}</em></span><span className="history-date">{new Date(entry.data_alteracao).toLocaleString('pt-BR')}</span></div>{entry.status_anterior && <div className="history-duration">Tempo em '{entry.status_anterior}': <strong>{timeInPreviousStatus}</strong></div>}</li>); })}</ul></div>
                    <div className="modal-actions"><button onClick={() => setIsEditing(true)} className="edit-btn">Editar</button><button onClick={handleDelete} className="delete-btn-modal">Deletar Tarefa</button><button onClick={onRequestClose} className="close-btn">Fechar</button></div>
                </div>
            )}
        </Modal>
    );
}
export default TaskDetailModal;