import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '25px', }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 } };
Modal.setAppElement('#root');

function TaskDetailModal({ isOpen, onRequestClose, task, sectors, statuses, onUpdateTask, onDeleteTask }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTask, setEditableTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [members, setMembers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (task) {
            const formattedDate = task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toISOString().split('T')[0] : '';
            setEditableTask({ ...task, data_prevista_conclusao: formattedDate });
        } else {
            setEditableTask(null);
        }
    }, [task]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (task) {
                try {
                    const [historyRes, membersRes] = await Promise.all([
                        api.get(`/tarefas/${task.id}/historico`),
                        api.get(`/setores/${task.setor_id}/membros`)
                    ]);
                    setHistory(historyRes.data);
                    setMembers(membersRes.data);
                } catch (error) {
                    toast.error("Não foi possível carregar os detalhes da tarefa.");
                    onRequestClose();
                }
            }
        };
        if (isOpen) {
            fetchDetails();
            setIsEditing(false);
        }
    }, [isOpen, task?.id]);

    const handleChange = (e) => { const { name, value } = e.target; setEditableTask(prev => ({ ...prev, [name]: value })); };
    
    const handleSaveChanges = async () => {
        setIsSaving(true);
        const taskToUpdate = { ...editableTask, responsavel_id: parseInt(editableTask.responsavel_id, 10) || null };
        try {
            await onUpdateTask(taskToUpdate.id, taskToUpdate);
            setIsEditing(false);
        } catch (error) {
            console.error("Falha ao salvar alterações:", error);
        } finally {
            setIsSaving(false);
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
                    <div className="form-grid">
                        <label>Responsável</label>
                        <select name="responsavel_id" value={editableTask.responsavel_id || ''} onChange={handleChange}>
                            <option value="">-- Ninguém --</option>
                            {/* ===== MUDANÇA AQUI ===== */}
                            {members.map(m => <option key={m.id} value={m.id}>{m.nome || m.email}</option>)}
                        </select>
                        <label>Setor</label><select name="setor_id" value={editableTask.setor_id} onChange={handleChange}>{sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select>
                        <label>Status</label><select name="status_id" value={editableTask.status_id} onChange={handleChange}>{ (statuses[editableTask.setor_id] || []).map(s => <option key={s.id} value={s.id}>{s.nome}</option>) }</select>
                        <label>Data Prevista</label><input type="date" name="data_prevista_conclusao" value={editableTask.data_prevista_conclusao} onChange={handleChange} />
                    </div>
                    <h3>Anotações</h3>
                    <textarea name="notas" value={editableTask.notas || ''} onChange={handleChange} className="modal-notes-textarea"></textarea>
                    <div className="modal-actions"><button onClick={handleSaveChanges} className="btn btn-success" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button><button onClick={handleCancelEdit} className="btn btn-secondary" disabled={isSaving}>Cancelar</button></div>
                </div>
            ) : (
                <div className="task-modal-view-mode">
                    <h2>{editableTask.descricao}</h2>
                    <div className="details-grid">
                        <span><strong>Status:</strong> <span className={`status-${editableTask.status_nome?.replace(' ', '-')}`}>{editableTask.status_nome}</span></span>
                        {/* ===== MUDANÇA AQUI ===== */}
                        <span><strong>Responsável:</strong> {editableTask.responsavel_nome || editableTask.responsavel_email || 'Ninguém'}</span>
                        <span><strong>Setor:</strong> {editableTask.setor_nome}</span>
                        <span><strong>Data Prevista:</strong> {formatDateForDisplay(editableTask.data_prevista_conclusao)}</span>
                    </div>
                    <h3>Anotações</h3>
                    <div className="notes-display">
                        {editableTask.notas || 'Nenhuma anotação adicionada.'}
                    </div>
                    <div className="history-section">
                        <h3>Histórico de Status</h3>
                        <ul className="history-list">{history.map((entry, index) => {
                            const timeInPreviousStatus = index > 0 ? calculateDuration(history[index - 1].data_alteracao, entry.data_alteracao) : calculateDuration(task.data_inclusao, entry.data_alteracao);
                            return (
                                <li key={index}>
                                    <div className="history-entry">
                                        {/* ===== MUDANÇA AQUI ===== */}
                                        <span>Movido para <strong>{entry.status_novo_nome}</strong> por <em>{entry.usuario_alteracao_nome || entry.usuario_alteracao_email}</em></span>
                                        <span className="history-date">{new Date(entry.data_alteracao).toLocaleString('pt-BR')}</span>
                                    </div>
                                    {entry.status_anterior_nome && <div className="history-duration">Tempo em '{entry.status_anterior_nome}': <strong>{timeInPreviousStatus}</strong></div>}
                                </li>
                            );
                        })}</ul>
                    </div>
                    <div className="modal-actions">
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary">Editar</button>
                        <button onClick={handleDelete} className="btn btn-danger">Deletar Tarefa</button>
                        <button onClick={onRequestClose} className="btn btn-secondary">Fechar</button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default TaskDetailModal;



/*
// Arquivo: gerenciador-tarefas-web/src/components/TaskDetailModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '25px', }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 } };
Modal.setAppElement('#root');

function TaskDetailModal({ isOpen, onRequestClose, task, sectors, statuses, onUpdateTask, onDeleteTask }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTask, setEditableTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [members, setMembers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (task) {
            const formattedDate = task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toISOString().split('T')[0] : '';
            setEditableTask({ ...task, data_prevista_conclusao: formattedDate });
        } else {
            setEditableTask(null);
        }
    }, [task]);

    useEffect(() => {
        const fetchDetails = async () => {
            if (task) {
                try {
                    const [historyRes, membersRes] = await Promise.all([
                        api.get(`/tarefas/${task.id}/historico`),
                        api.get(`/setores/${task.setor_id}/membros`)
                    ]);
                    setHistory(historyRes.data);
                    setMembers(membersRes.data);
                } catch (error) {
                    toast.error("Não foi possível carregar os detalhes da tarefa.");
                    onRequestClose();
                }
            }
        };
        if (isOpen) {
            fetchDetails();
            setIsEditing(false);
        }
    }, [isOpen, task?.id]);

    const handleChange = (e) => { const { name, value } = e.target; setEditableTask(prev => ({ ...prev, [name]: value })); };
    
    const handleSaveChanges = async () => {
        setIsSaving(true);
        const taskToUpdate = { ...editableTask, responsavel_id: parseInt(editableTask.responsavel_id, 10) || null };
        try {
            await onUpdateTask(taskToUpdate.id, taskToUpdate);
            setIsEditing(false);
        } catch (error) {
            console.error("Falha ao salvar alterações:", error);
        } finally {
            setIsSaving(false);
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
                    <div className="form-grid">
                        <label>Responsável</label><select name="responsavel_id" value={editableTask.responsavel_id || ''} onChange={handleChange}><option value="">-- Ninguém --</option>{members.map(m => <option key={m.id} value={m.id}>{m.email}</option>)}</select>
                        <label>Setor</label><select name="setor_id" value={editableTask.setor_id} onChange={handleChange}>{sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select>
                        <label>Status</label><select name="status_id" value={editableTask.status_id} onChange={handleChange}>{ (statuses[editableTask.setor_id] || []).map(s => <option key={s.id} value={s.id}>{s.nome}</option>) }</select>
                        <label>Data Prevista</label><input type="date" name="data_prevista_conclusao" value={editableTask.data_prevista_conclusao} onChange={handleChange} />
                    </div>
                    <h3>Anotações</h3>
                    <textarea name="notas" value={editableTask.notas || ''} onChange={handleChange} className="modal-notes-textarea"></textarea>
                    <div className="modal-actions"><button onClick={handleSaveChanges} className="btn btn-success" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button><button onClick={handleCancelEdit} className="btn btn-secondary" disabled={isSaving}>Cancelar</button></div>
                </div>
            ) : (
                <div className="task-modal-view-mode">
                    <h2>{editableTask.descricao}</h2>
                    <div className="details-grid">
                        <span><strong>Status:</strong> <span className={`status-${editableTask.status_nome?.replace(' ', '-')}`}>{editableTask.status_nome}</span></span>
                        <span><strong>Responsável:</strong> {editableTask.responsavel_email || 'Ninguém'}</span>
                        <span><strong>Setor:</strong> {editableTask.setor_nome}</span>
                        <span><strong>Data Prevista:</strong> {formatDateForDisplay(editableTask.data_prevista_conclusao)}</span>
                    </div>

                    
                    <h3>Anotações</h3>
                    <div className="notes-display">
                        {editableTask.notas || 'Nenhuma anotação adicionada.'}
                    </div>

                    <div className="history-section">
                        <h3>Histórico de Status</h3>
                        <ul className="history-list">{history.map((entry, index) => {
                            const timeInPreviousStatus = index > 0 ? calculateDuration(history[index - 1].data_alteracao, entry.data_alteracao) : calculateDuration(task.data_inclusao, entry.data_alteracao);
                            return (
                                <li key={index}>
                                    <div className="history-entry">
                                        <span>Movido para <strong>{entry.status_novo_nome}</strong> por <em>{entry.usuario_alteracao_email}</em></span>
                                        <span className="history-date">{new Date(entry.data_alteracao).toLocaleString('pt-BR')}</span>
                                    </div>
                                    {entry.status_anterior_nome && <div className="history-duration">Tempo em '{entry.status_anterior_nome}': <strong>{timeInPreviousStatus}</strong></div>}
                                </li>
                            );
                        })}</ul>
                    </div>
                    <div className="modal-actions">
                        <button onClick={() => setIsEditing(true)} className="btn btn-primary">Editar</button>
                        <button onClick={handleDelete} className="btn btn-danger">Deletar Tarefa</button>
                        <button onClick={onRequestClose} className="btn btn-secondary">Fechar</button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default TaskDetailModal;*/

/*
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '600px', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '25px', }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000 } };
Modal.setAppElement('#root');

function TaskDetailModal({ isOpen, onRequestClose, task, sectors, statuses, onUpdateTask, onDeleteTask }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editableTask, setEditableTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [members, setMembers] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { const fetchDetails = async () => { if (task) { try { const [historyRes, membersRes] = await Promise.all([ api.get(`/tarefas/${task.id}/historico`), api.get(`/setores/${task.setor_id}/membros`) ]); setHistory(historyRes.data); setMembers(membersRes.data); } catch (error) { toast.error("Não foi possível carregar os detalhes da tarefa."); onRequestClose(); } } }; if (isOpen) { fetchDetails(); setIsEditing(false); } }, [isOpen, task?.id]);
    useEffect(() => { if (task) { const formattedDate = task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toISOString().split('T')[0] : ''; setEditableTask({ ...task, data_prevista_conclusao: formattedDate }); } else { setEditableTask(null); } }, [task]);

    const handleChange = (e) => { const { name, value } = e.target; setEditableTask(prev => ({ ...prev, [name]: value })); };
    const handleSaveChanges = async () => { setIsSaving(true); const taskToUpdate = { ...editableTask, responsavel_id: parseInt(editableTask.responsavel_id, 10) || null }; try { await onUpdateTask(taskToUpdate.id, taskToUpdate); setIsEditing(false); } catch (error) { console.error("Falha ao salvar alterações:", error); } finally { setIsSaving(false); } };
    const handleCancelEdit = () => { const formattedDate = task.data_prevista_conclusao ? new Date(task.data_prevista_conclusao).toISOString().split('T')[0] : ''; setEditableTask({ ...task, data_prevista_conclusao: formattedDate }); setIsEditing(false); };
    const handleDelete = () => { if (window.confirm("Tem certeza?")) { onDeleteTask(task.id); onRequestClose(); } };
    const calculateDuration = (startDate, endDate) => { const start = new Date(startDate); const end = new Date(endDate); let diffMs = end - start; if (diffMs < 0) return '0m'; let duration = []; const days = Math.floor(diffMs / 86400000); if(days > 0) duration.push(`${days}d`); diffMs %= 86400000; const hours = Math.floor(diffMs / 3600000); if(hours > 0) duration.push(`${hours}h`); diffMs %= 3600000; const minutes = Math.floor(diffMs / 60000); if(minutes > 0 || duration.length === 0) duration.push(`${minutes}m`); return duration.join(' '); };
    const formatDateForDisplay = (dateString) => { if (!dateString) return 'N/A'; const date = new Date(dateString); const userTimezoneOffset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR'); };
    
    useEffect(() => { if (task) { setEditableTask(prev => ({...prev, ...task})); } }, [task]);

    if (!isOpen || !editableTask) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Detalhes da Tarefa">
            {isEditing ? (
                <div className="task-modal-edit-mode">
                    <input type="text" name="descricao" value={editableTask.descricao} onChange={handleChange} className="modal-title-input" />
                    <div className="form-grid"><label>Responsável</label><select name="responsavel_id" value={editableTask.responsavel_id || ''} onChange={handleChange}><option value="">-- Ninguém --</option>{members.map(m => <option key={m.id} value={m.id}>{m.email}</option>)}</select><label>Setor</label><select name="setor_id" value={editableTask.setor_id} onChange={handleChange}>{sectors.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}</select><label>Status</label><select name="status_id" value={editableTask.status_id} onChange={handleChange}>{ (statuses[editableTask.setor_id] || []).map(s => <option key={s.id} value={s.id}>{s.nome}</option>) }</select><label>Data Prevista</label><input type="date" name="data_prevista_conclusao" value={editableTask.data_prevista_conclusao} onChange={handleChange} /></div>
                    <h3>Anotações</h3><textarea name="notas" value={editableTask.notas || ''} onChange={handleChange} className="modal-notes-textarea"></textarea>
                    <div className="modal-actions"><button onClick={handleSaveChanges} className="save-btn" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</button><button onClick={handleCancelEdit} className="cancel-btn" disabled={isSaving}>Cancelar</button></div>
                </div>
            ) : (
                <div className="task-modal-view-mode">
                    <h2>{editableTask.descricao}</h2>
                    <div className="details-grid"><span><strong>Status:</strong> <span className={`status-${editableTask.status_nome?.replace(' ', '-')}`}>{editableTask.status_nome}</span></span><span><strong>Responsável:</strong> {editableTask.responsavel_email || 'Ninguém'}</span><span><strong>Setor:</strong> {editableTask.setor_nome}</span><span><strong>Data Prevista:</strong> {formatDateForDisplay(editableTask.data_prevista_conclusao)}</span></div>
                    <div className="history-section">
                        <h3>Histórico de Status</h3>
                        <ul className="history-list">{history.map((entry, index) => {
                            const timeInPreviousStatus = index > 0 ? calculateDuration(history[index - 1].data_alteracao, entry.data_alteracao) : calculateDuration(task.data_inclusao, entry.data_alteracao);
                            return (
                                <li key={index}>
                                    <div className="history-entry">
                                        <span>Movido para <strong>{entry.status_novo_nome}</strong> por <em>{entry.usuario_alteracao_email}</em></span>
                                        <span className="history-date">{new Date(entry.data_alteracao).toLocaleString('pt-BR')}</span>
                                    </div>
                                    {entry.status_anterior_nome && <div className="history-duration">Tempo em '{entry.status_anterior_nome}': <strong>{timeInPreviousStatus}</strong></div>}
                                </li>
                            );
                        })}</ul>
                    </div>
                    <div className="modal-actions"><button onClick={() => setIsEditing(true)} className="edit-btn">Editar</button><button onClick={handleDelete} className="delete-btn-modal">Deletar Tarefa</button><button onClick={onRequestClose} className="close-btn">Fechar</button></div>
                </div>
            )}
        </Modal>
    );
}

export default TaskDetailModal;
*/
