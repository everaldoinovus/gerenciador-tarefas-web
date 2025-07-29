import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { toast } from 'react-toastify';
import api from '../services/api';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const customModalStyles = { content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', width: '550px', border: '1px solid #ccc', borderRadius: '8px', padding: '0', overflow: 'hidden' }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' } };
Modal.setAppElement('#root');

// Componente para um item da lista de status, para facilitar a edição
const StatusItem = ({ status, onRename, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(status.nome);

    const handleRename = () => {
        if (name.trim() && name !== status.nome) {
            onRename(status.id, name);
        }
        setIsEditing(false);
    };

    return (
        <div className="status-item">
            {isEditing ? (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    autoFocus
                />
            ) : (
                <span onDoubleClick={() => setIsEditing(true)}>{status.nome}</span>
            )}
            <div className="status-item-actions">
                <button onClick={() => setIsEditing(true)} className="action-btn">✏️</button>
                <button onClick={() => onDelete(status.id)} className="action-btn">🗑️</button>
            </div>
        </div>
    );
};

function SettingsModal({ isOpen, onRequestClose, sector, onSettingsChange }) {
    const [activeTab, setActiveTab] = useState('members');
    const [members, setMembers] = useState([]);
    const [emailToInvite, setEmailToInvite] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [newStatusName, setNewStatusName] = useState('');

    const fetchMembers = async () => { if (!sector) return; try { const response = await api.get(`/setores/${sector.id}/membros`); setMembers(response.data); } catch (error) { toast.error("Não foi possível carregar os membros."); } };
    const fetchStatuses = async () => { if (!sector) return; try { const response = await api.get(`/setores/${sector.id}/status`); setStatuses(response.data); } catch (error) { toast.error("Não foi possível carregar os status."); } };
    
    useEffect(() => {
        if (isOpen && sector) {
            if (activeTab === 'members') fetchMembers();
            if (activeTab === 'statuses') fetchStatuses();
        }
    }, [isOpen, sector, activeTab]);

    const handleInvite = async (e) => { e.preventDefault(); if (!emailToInvite.trim() || !sector) return; try { await api.post(`/setores/${sector.id}/convidar`, { email: emailToInvite }); toast.success(`Convite enviado para ${emailToInvite}!`); setEmailToInvite(''); } catch (error) { toast.error(error.response?.data?.error || "Falha ao enviar convite."); } };
    const handleAddStatus = async (e) => { e.preventDefault(); if (!newStatusName.trim()) return; try { const response = await api.post(`/setores/${sector.id}/status`, { nome: newStatusName }); setStatuses([...statuses, response.data]); setNewStatusName(''); onSettingsChange(); toast.success("Coluna adicionada!"); } catch (error) { toast.error(error.response?.data?.error || "Erro ao adicionar coluna.") } };
    //const handleDeleteStatus = async (statusId) => { if (!window.confirm("Tem certeza? Deletar uma coluna que contém tarefas não será permitido.")) return; try { await api.delete(`/status/${statusId}`); setStatuses(statuses.filter(s => s.id !== statusId)); onSettingsChange(); toast.success("Coluna deletada!"); } catch (error) { toast.error(error.response?.data?.error || "Erro ao deletar coluna.") } };
	const handleDeleteStatus = async (statusId) => {
    // PONTO DE VERIFICAÇÃO 1: Confirmação da Ação
    alert(`PASSO 1 (Modal):\n\nPronto para deletar o Status com ID: ${statusId}.\n\nClique em OK para continuar.`);

    if (!window.confirm("Esta é a confirmação final. Tem certeza que deseja deletar?")) {
        alert("Ação cancelada pelo usuário.");
        return;
    }

    try {
        // PONTO DE VERIFICAÇÃO 2: Antes da Chamada da API
        alert(`PASSO 2 (Modal):\n\nChamando a API em 'DELETE /status/${statusId}'.\n\nClique em OK para enviar a requisição.`);
        
        await api.delete(`/status/${statusId}`);
        
        // PONTO DE VERIFICAÇÃO 3: Após o Sucesso da API
        alert(`PASSO 3 (Modal):\n\nA API respondeu com sucesso!\n\nAgora chamando 'onSettingsChange()' para atualizar a tela.`);

        toast.success("Coluna deletada!");
        onSettingsChange();
        
    } catch (error) {
        // PONTO DE VERIFICAÇÃO 4: Em Caso de Erro na API
        const errorMessage = error.response?.data?.error || error.message;
        alert(`PASSO 4 (Modal) - ERRO:\n\nA API retornou um erro:\n\n${errorMessage}`);

        toast.error(errorMessage);
    }
};
	
	
    const handleRenameStatus = async (statusId, newName) => { try { await api.put(`/status/${statusId}`, { nome: newName }); const newStatuses = statuses.map(s => s.id === statusId ? { ...s, nome: newName } : s); setStatuses(newStatuses); onSettingsChange(); toast.success("Coluna renomeada!"); } catch (error) { toast.error(error.response?.data?.error || "Erro ao renomear coluna.") } };
    
    // Rota para reordenar ainda não foi criada, mas a lógica do front-end está aqui
    const handleDragEnd = (result) => { if (!result.destination) return; const items = Array.from(statuses); const [reorderedItem] = items.splice(result.source.index, 1); items.splice(result.destination.index, 0, reorderedItem); setStatuses(items); /* Lógica para salvar a nova ordem na API virá aqui */ };

    if (!sector) return null;

    return (
        <Modal isOpen={isOpen} onRequestClose={onRequestClose} style={customModalStyles} contentLabel="Configurações do Setor">
            <div className="settings-modal-header"><h2>Configurações - {sector.nome}</h2><div className="tabs"><button onClick={() => setActiveTab('members')} className={activeTab === 'members' ? 'active' : ''}>Membros</button><button onClick={() => setActiveTab('statuses')} className={activeTab === 'statuses' ? 'active' : ''}>Colunas / Status</button></div></div>
            <div className="settings-modal-content">
                {activeTab === 'members' ? (
                    <div className="members-tab"><div className="invite-section"><h4>Convidar Novo Membro</h4><form onSubmit={handleInvite} className="invite-form"><input type="email" value={emailToInvite} onChange={(e) => setEmailToInvite(e.target.value)} placeholder="E-mail do novo membro" required /><button type="submit">Convidar</button></form></div><div className="members-list-section"><h4>Membros Atuais</h4><ul className="members-list">{members.map(member => (<li key={member.id}><span>{member.email}</span><span className="member-role">{member.funcao}</span></li>))}</ul></div></div>
                ) : (
                    <div className="statuses-tab">
                        <div className="add-status-section"><h4>Adicionar Nova Coluna</h4><form onSubmit={handleAddStatus} className="add-status-form"><input type="text" value={newStatusName} onChange={e => setNewStatusName(e.target.value)} placeholder="Nome da nova coluna" required /><button type="submit">Adicionar</button></form></div>
                        <div className="status-list-section">
                            <h4>Colunas Atuais (Arraste para reordenar)</h4>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="statuses">
                                    {(provided) => (
                                        <ul className="status-list" {...provided.droppableProps} ref={provided.innerRef}>
                                            {statuses.map((status, index) => (
                                                <Draggable key={status.id} draggableId={status.id.toString()} index={index}>
                                                    {(provided, snapshot) => (
                                                        <li ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`status-list-item ${snapshot.isDragging ? 'is-dragging' : ''}`}>
                                                            <StatusItem status={status} onRename={handleRenameStatus} onDelete={handleDeleteStatus} />
                                                        </li>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    </div>
                )}
            </div>
            <div className="settings-modal-footer"><button onClick={onRequestClose} className="close-modal-btn">Fechar</button></div>
        </Modal>
    );
}

export default SettingsModal;