// Arquivo: gerenciador-tarefas-web/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import SectorManager from '../components/SectorManager';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import SettingsModal from '../components/SettingsModal'; // Importa o novo modal
import InvitationsBell from '../components/InvitationsBell';
import TaskFilter from '../components/TaskFilter';
import BoardView from '../components/BoardView';
import TaskCard from '../components/TaskCard';

function DashboardPage() {
    const { logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [filters, setFilters] = useState({ responsavel: '', data: '' });
    const [viewMode, setViewMode] = useState('board');
    const [isLoading, setIsLoading] = useState(false);
    const [statuses, setStatuses] = useState({});
    const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const [sectorForSettings, setSectorForSettings] = useState(null);

    const fetchTasks = async () => { setIsLoading(true); try { const response = await api.get('/tarefas', { params: filters }); setTasks(response.data); return response.data; } catch (error) { console.error("Erro ao buscar tarefas:", error); if (error.response?.status !== 401) toast.error("Falha ao carregar tarefas."); } finally { setIsLoading(false); } };
    const fetchSectorsAndStatuses = async () => { try { const sectorsRes = await api.get('/setores'); const sectorsData = sectorsRes.data; setSectors(sectorsData); const statusesPromises = sectorsData.map(sector => api.get(`/setores/${sector.id}/status`)); const statusesResults = await Promise.all(statusesPromises); const statusesMap = {}; statusesResults.forEach((result, index) => { const sectorId = sectorsData[index].id; statusesMap[sectorId] = result.data; }); setStatuses(statusesMap); } catch (error) { console.error("Erro ao buscar setores ou status:", error); toast.error("Falha ao carregar a estrutura dos setores."); } };
    
    useEffect(() => {
        const initialLoad = async () => { setIsLoading(true); await Promise.all([fetchSectorsAndStatuses(), fetchTasks()]); setIsLoading(false); };
        initialLoad();
    }, []);

    useEffect(() => {
        const isInitialLoad = tasks.length === 0 && sectors.length === 0;
        if (!isInitialLoad) { fetchTasks(); }
    }, [filters]);
    
    const handleAddTask = async (taskData) => { try { await api.post('/tarefas', taskData); toast.success("Tarefa adicionada com sucesso!"); fetchTasks(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao adicionar tarefa."); } };
    const handleUpdateTask = async (taskId, updatedData) => { try { await api.put(`/tarefas/${taskId}`, updatedData); if (!updatedData.status_id) { toast.success("Tarefa atualizada com sucesso!"); } const newTasks = await fetchTasks(); const newlyFetchedTask = newTasks.find(t => t.id === taskId); if (newlyFetchedTask) { setSelectedTask(newlyFetchedTask); } } catch (error) { toast.error(error.response?.data?.error || "Erro ao atualizar tarefa."); return Promise.reject(error); } };
    const handleUpdateTaskStatus = (taskId, updateData) => { const taskToUpdate = tasks.find(task => task.id === taskId); if (taskToUpdate) { const updatedTask = { ...taskToUpdate, ...updateData }; if (updateData.status_id) { const newStatus = statuses[taskToUpdate.setor_id]?.find(s => s.id === updateData.status_id); if(newStatus) updatedTask.status_nome = newStatus.nome; } setTasks(tasks.map(t => t.id === taskId ? updatedTask : t)); api.put(`/tarefas/${taskId}`, updateData).catch(err => { toast.error("Falha ao atualizar status."); fetchTasks(); }); } };
    const handleDeleteTask = async (taskId) => { try { await api.delete(`/tarefas/${taskId}`); toast.success("Tarefa deletada com sucesso!"); fetchTasks(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao deletar tarefa."); } };
    const handleSectorsUpdate = () => { fetchSectorsAndStatuses(); };
    const handleAcceptInvitation = () => { fetchSectorsAndStatuses(); };

    const handleFilterChange = (filterName, value) => { setFilters(prevFilters => ({ ...prevFilters, [filterName]: value })); };
    const openTaskModal = (sector) => { setSelectedSector(sector); setIsTaskModalOpen(true); };
    const closeTaskModal = () => { setIsTaskModalOpen(false); setSelectedSector(null); };
    const openDetailModal = (task) => { setSelectedTask(task); setIsDetailModalOpen(true); };
    const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedTask(null); };
    const openSettingsModal = (sector) => { setSectorForSettings(sector); setIsSettingsModalOpen(true); };
    const closeSettingsModal = () => { setIsSettingsModalOpen(false); setSectorForSettings(null); };
    const tasksBySector = tasks.reduce((acc, task) => { const sectorId = task.setor_id; if (!acc[sectorId]) { acc[sectorId] = []; } acc[sectorId].push(task); return acc; }, {});

    return (
        <div className="container">
            {isLoading && (<div className="loading-overlay"><ClipLoader color={"#007bff"} size={80} /></div>)}
            <header className="main-header"><h1>Meu Gerenciador de Tarefas</h1><div className="header-controls"><InvitationsBell onAcceptInvitation={handleAcceptInvitation} /><button onClick={logout} className="logout-btn">Sair</button></div></header>
            <div className="main-controls"><button onClick={() => setIsSectorModalOpen(true)} className="manage-sectors-btn">Gerenciar Setores</button></div>
            <TaskFilter onFilterChange={handleFilterChange} />
            <div className="view-switcher"><button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Lista</button><button onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'active' : ''}>Quadro</button></div>
            <div className="sectors-container">
                {[...sectors].sort((a, b) => a.nome.localeCompare(b.nome)).map(sector => {
                    const tasksForThisSector = tasksBySector[sector.id] || [];
                    const sectorStatuses = statuses[sector.id] || [];
                    return (
                        <section key={sector.id} className="sector-group">
                            <div className="sector-header">
                                <div className="sector-title-controls">
                                    <button onClick={() => openTaskModal(sector)} className="add-task-btn">+Tarefa</button>
                                    <h2>Setor: {sector.nome}</h2>
                                </div>
                                {sector.funcao === 'dono' && (<button onClick={() => openSettingsModal(sector)} className="settings-btn" title="Configurações do setor">⚙️</button>)}
                            </div>
                            {viewMode === 'list' ? (
                                <div className="task-list">
                                    {/* Adicionar lógica de lista aqui */}
                                    <p>Visualização em lista a ser implementada com status dinâmicos.</p>
                                </div>
                            ) : (
                                <BoardView tasks={tasksForThisSector} statuses={sectorStatuses} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} />
                            )}
                        </section>
                    );
                })}
            </div>
            
            {/* CÓDIGO RESTAURADO AQUI */}
            <SectorManager isOpen={isSectorModalOpen} onRequestClose={() => setIsSectorModalOpen(false)} onSectorsUpdate={handleSectorsUpdate} />
            <TaskModal isOpen={isTaskModalOpen} onRequestClose={closeTaskModal} onTaskAdd={handleAddTask} sector={selectedSector} />
            <TaskDetailModal isOpen={isDetailModalOpen} onRequestClose={closeDetailModal} task={selectedTask} sectors={sectors} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            <SettingsModal 
				isOpen={isSettingsModalOpen} 
				onRequestClose={closeSettingsModal} 
				sector={sectorForSettings} 
				//onSettingsChange={handleSettingsChange}
			/>
        </div>
    );
}

export default DashboardPage;