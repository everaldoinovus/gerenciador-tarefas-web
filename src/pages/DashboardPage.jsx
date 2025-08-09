// Arquivo: gerenciador-tarefas-web/src/pages/DashboardPage.jsx
// Arquivo: gerenciador-tarefas-web/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Importe os componentes
import SectorManager from '../components/SectorManager';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import SettingsModal from '../components/SettingsModal';
import InvitationsBell from '../components/InvitationsBell';
import TaskFilter from '../components/TaskFilter';
import BoardView from '../components/BoardView';
// Crie um novo componente para a visualização em lista
import TaskListView from '../components/TaskListView'; 

// Crie um novo arquivo CSS para esta página
import './DashboardPage.css'; 

function DashboardPage() {
    const { logout, userInfo } = useAuth();
    
    // Estados existentes
    const [tasks, setTasks] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [filters, setFilters] = useState({ responsavel: '', data: '' });
    const [viewMode, setViewMode] = useState('board');
    const [isLoading, setIsLoading] = useState(true);
    const [statuses, setStatuses] = useState({});

    // NOVO ESTADO: para controlar qual setor está ativo
    const [activeSectorId, setActiveSectorId] = useState(null);
    
    // Estados dos modais (sem alteração)
    const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [sectorForSettings, setSectorForSettings] = useState(null);

    // Funções de busca de dados (com uma pequena adição)
    const fetchTasks = async () => { setIsLoading(true); try { const response = await api.get('/tarefas', { params: filters }); setTasks(response.data); return response.data; } catch (error) { console.error("Erro ao buscar tarefas:", error); if (error.response?.status !== 401) toast.error("Falha ao carregar tarefas."); } finally { setIsLoading(false); } };
    const fetchSectorsAndStatuses = async () => {
        try {
            const sectorsRes = await api.get('/setores');
            const sectorsData = sectorsRes.data;
            const sortedSectors = [...sectorsData].sort((a, b) => a.nome.localeCompare(b.nome));
            setSectors(sortedSectors);

            // Define o primeiro setor como ativo na carga inicial
            if (sortedSectors.length > 0 && !activeSectorId) {
                setActiveSectorId(sortedSectors[0].id);
            }
            
            const statusesPromises = sectorsData.map(sector => api.get(`/setores/${sector.id}/status`));
            const statusesResults = await Promise.all(statusesPromises);
            const statusesMap = {};
            statusesResults.forEach((result, index) => {
                const sectorId = sectorsData[index].id;
                statusesMap[sectorId] = result.data;
            });
            setStatuses(statusesMap);
        } catch (error) {
            console.error("Erro ao buscar setores ou status:", error);
            toast.error("Falha ao carregar a estrutura dos setores.");
        }
    };
    
    const refreshAllData = () => Promise.all([fetchSectorsAndStatuses(), fetchTasks()]);
    
    useEffect(() => {
        refreshAllData().finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        if (sectors.length > 0) { // Evita a busca na carga inicial
            fetchTasks();
        }
    }, [filters]);
    
    // Funções de manipulação (sem alteração na lógica, apenas no fluxo)
    const handleAddTask = async (taskData) => { try { await api.post('/tarefas', taskData); toast.success("Tarefa adicionada com sucesso!"); refreshAllData(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao adicionar tarefa."); } };
    const handleUpdateTask = async (taskId, updatedData) => { try { await api.put(`/tarefas/${taskId}`, updatedData); if (!updatedData.status_id) { toast.success("Tarefa atualizada com sucesso!"); } const newTasks = await fetchTasks(); const newlyFetchedTask = newTasks.find(t => t.id === taskId); if (newlyFetchedTask) { setSelectedTask(newlyFetchedTask); } } catch (error) { toast.error(error.response?.data?.error || "Erro ao atualizar tarefa."); return Promise.reject(error); } };
    const handleUpdateTaskStatus = (taskId, updateData) => { /* ... sua função otimizada ... */ };
    const handleDeleteTask = async (taskId) => { try { await api.delete(`/tarefas/${taskId}`); toast.success("Tarefa deletada com sucesso!"); refreshAllData(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao deletar tarefa."); } };
    const handleAcceptInvitation = () => refreshAllData();
    const handleFilterChange = (filterName, value) => setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
    const openTaskModal = () => setIsTaskModalOpen(true);
    const closeTaskModal = () => setIsTaskModalOpen(false);
    const openDetailModal = (task) => { setSelectedTask(task); setIsDetailModalOpen(true); };
    const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedTask(null); };
    const openSettingsModal = (sector) => { setSectorForSettings(sector); setIsSettingsModalOpen(true); };
    const closeSettingsModal = () => { setIsSettingsModalOpen(false); setSectorForSettings(null); };

    // Lógica para obter os dados do setor ativo
    const activeSector = sectors.find(s => s.id === activeSectorId);
    const tasksForActiveSector = tasks.filter(task => task.setor_id === activeSectorId);
    const statusesForActiveSector = statuses[activeSectorId] || [];
    const showSettingsForActiveSector = activeSector && (activeSector.funcao === 'dono' || userInfo?.funcaoGlobal === 'master');

    return (
        <div className="dashboard-layout">
            {isLoading && (<div className="loading-overlay"><ClipLoader color={"var(--cor-primaria)"} size={80} /></div>)}

            {/* --- BARRA LATERAL DE NAVEGAÇÃO (SIDEBAR) --- */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h2>Setores</h2>
                </div>
                <nav className="sector-nav-list">
                    {sectors.map(sector => (
                        <button 
                            key={sector.id}
                            className={`sector-nav-item ${sector.id === activeSectorId ? 'active' : ''}`}
                            onClick={() => setActiveSectorId(sector.id)}
                        >
                            {sector.nome}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    {userInfo?.funcaoGlobal === 'master' && (
                        <button onClick={() => setIsSectorModalOpen(true)} className="btn btn-info">
                            Gerenciar Setores
                        </button>
                    )}
                    <div className="user-controls">
                        <InvitationsBell onAcceptInvitation={handleAcceptInvitation} />
                        <button onClick={logout} className="btn btn-secondary">Sair</button>
                    </div>
                </div>
            </aside>

            {/* --- ÁREA DE CONTEÚDO PRINCIPAL --- */}
            <main className="dashboard-main-content">
                <header className="main-content-header">
                    {activeSector ? (
                        <div className="sector-title-area">
                            <h1>{activeSector.nome}</h1>
                            <div className="sector-actions">
                                <button onClick={openTaskModal} className="btn btn-success">+ Nova Tarefa</button>
                                {showSettingsForActiveSector && (
                                    <button onClick={() => openSettingsModal(activeSector)} className="settings-btn" title="Configurações do setor">⚙️</button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <h1>Dashboard</h1>
                    )}
                    <div className="global-actions">
                        {userInfo?.funcaoGlobal === 'master' && (
                            <Link to="/automations" className="nav-link">Automações</g-link>
                        )}
                    </div>
                </header>
                
                <div className="view-controls">
                    <TaskFilter onFilterChange={handleFilterChange} />
                    <div className="view-switcher">
                        <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Lista</button>
                        <button onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'active' : ''}>Quadro</button>
                    </div>
                </div>

                <div className="content-area">
                    {!activeSectorId && !isLoading && <p className="empty-state">Selecione um setor para começar ou crie um novo em "Gerenciar Setores".</p>}
                    
                    {activeSectorId && viewMode === 'board' && (
                        <BoardView 
                            tasks={tasksForActiveSector} 
                            statuses={statusesForActiveSector} 
                            onCardClick={openDetailModal} 
                            onUpdateStatus={handleUpdateTaskStatus} 
                        />
                    )}
                    {activeSectorId && viewMode === 'list' && (
                        <TaskListView 
                            tasks={tasksForActiveSector} 
                            onCardClick={openDetailModal} 
                        />
                    )}
                </div>
            </main>

            {/* --- MODAIS --- */}
            <SectorManager isOpen={isSectorModalOpen} onRequestClose={() => setIsSectorModalOpen(false)} onSectorsUpdate={refreshAllData} />
            <TaskModal isOpen={isTaskModalOpen} onRequestClose={closeTaskModal} onTaskAdd={handleAddTask} sector={activeSector} />
            <TaskDetailModal isOpen={isDetailModalOpen} onRequestClose={closeDetailModal} task={selectedTask} sectors={sectors} statuses={statuses} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            <SettingsModal isOpen={isSettingsModalOpen} onRequestClose={closeSettingsModal} sector={sectorForSettings} onSettingsChange={refreshAllData} />
        </div>
    );
}

export default DashboardPage;


/*
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import SectorManager from '../components/SectorManager';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import SettingsModal from '../components/SettingsModal';
import InvitationsBell from '../components/InvitationsBell';
import TaskFilter from '../components/TaskFilter';
import BoardView from '../components/BoardView';
import TaskCard from '../components/TaskCard';

function DashboardPage() {
    const { logout, userInfo } = useAuth();
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
    
    const refreshAllData = () => {
        return Promise.all([fetchSectorsAndStatuses(), fetchTasks()]);
    };
    
    useEffect(() => {
        setIsLoading(true);
        refreshAllData().finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const isInitialLoad = tasks.length === 0 && sectors.length === 0;
        if (!isInitialLoad) { fetchTasks(); }
    }, [filters]);
    
    const handleAddTask = async (taskData) => { try { await api.post('/tarefas', taskData); toast.success("Tarefa adicionada com sucesso!"); refreshAllData(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao adicionar tarefa."); } };
    const handleUpdateTask = async (taskId, updatedData) => { try { await api.put(`/tarefas/${taskId}`, updatedData); if (!updatedData.status_id) { toast.success("Tarefa atualizada com sucesso!"); } const newTasks = await fetchTasks(); const newlyFetchedTask = newTasks.find(t => t.id === taskId); if (newlyFetchedTask) { setSelectedTask(newlyFetchedTask); } } catch (error) { toast.error(error.response?.data?.error || "Erro ao atualizar tarefa."); return Promise.reject(error); } };
    
    // FUNÇÃO OTIMIZADA
    const handleUpdateTaskStatus = (taskId, updateData) => {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
            // 1. Atualiza a UI otimisticamente para a movimentação ser instantânea
            const updatedTask = { ...taskToUpdate, ...updateData };
            if (updateData.status_id) {
                const newStatus = statuses[taskToUpdate.setor_id]?.find(s => s.id === updateData.status_id);
                if (newStatus) {
                    updatedTask.status_nome = newStatus.nome;
                }
            }
            setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
            
            // 2. Envia a atualização para a API em segundo plano
            api.put(`/tarefas/${taskId}`, updateData)
                .then(() => {
                    // 3. APÓS o sucesso, busca os dados novamente para revelar
                    // qualquer tarefa criada por automação, de forma silenciosa.
                    fetchTasks();
                })
                .catch(err => {
                    // Se a API falhar, mostra um erro e reverte a UI
                    toast.error("Falha ao atualizar status.");
                    fetchTasks();
                });
        }
    };

    const handleDeleteTask = async (taskId) => { try { await api.delete(`/tarefas/${taskId}`); toast.success("Tarefa deletada com sucesso!"); refreshAllData(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao deletar tarefa."); } };
    const handleAcceptInvitation = () => { refreshAllData(); };

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
            <header className="main-header"><h1>Meu Gerenciador de Tarefas</h1><div className="header-controls">{userInfo?.funcaoGlobal === 'master' && ( <Link to="/automations" className="nav-link">Automações</Link> )}<InvitationsBell onAcceptInvitation={handleAcceptInvitation} /><button onClick={logout} className="btn btn-secondary">Sair</button></div></header>
            <div className="main-controls">{(userInfo?.funcaoGlobal === 'master') && ( <button onClick={() => setIsSectorModalOpen(true)} className="btn btn-info"> Gerenciar Setores </button> )}</div>
            <TaskFilter onFilterChange={handleFilterChange} />
            <div className="view-switcher"><button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Lista</button><button onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'active' : ''}>Quadro</button></div>
            <div className="sectors-container">{[...sectors].sort((a, b) => a.nome.localeCompare(b.nome)).map(sector => {
                const tasksForThisSector = tasksBySector[sector.id] || [];
                const sectorStatuses = statuses[sector.id] || [];
                const showSettings = sector.funcao === 'dono' || userInfo?.funcaoGlobal === 'master';
                return (
                    <section key={sector.id} className="sector-group">
                        <div className="sector-header"><div className="sector-title-controls"><button onClick={() => openTaskModal(sector)} className="btn btn-success">+Tarefa</button><h2>Setor: {sector.nome}</h2></div>{showSettings && (<button onClick={() => openSettingsModal(sector)} className="settings-btn" title="Configurações do setor">⚙️</button>)}</div>
                        {viewMode === 'list' ? ( <div className="task-list">...</div> ) : ( <BoardView tasks={tasksForThisSector} statuses={sectorStatuses} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} /> )}
                    </section>
                );
            })}
            </div>
            <SectorManager isOpen={isSectorModalOpen} onRequestClose={() => setIsSectorModalOpen(false)} onSectorsUpdate={refreshAllData} />
            <TaskModal isOpen={isTaskModalOpen} onRequestClose={closeTaskModal} onTaskAdd={handleAddTask} sector={selectedSector} />
            <TaskDetailModal isOpen={isDetailModalOpen} onRequestClose={closeDetailModal} task={selectedTask} sectors={sectors} statuses={statuses} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            <SettingsModal isOpen={isSettingsModalOpen} onRequestClose={closeSettingsModal} sector={sectorForSettings} onSettingsChange={refreshAllData} />
        </div>
    );
}

export default DashboardPage;
*/
/*
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import SectorManager from '../components/SectorManager';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import SettingsModal from '../components/SettingsModal';
import InvitationsBell from '../components/InvitationsBell';
import TaskFilter from '../components/TaskFilter';
import BoardView from '../components/BoardView';
import TaskCard from '../components/TaskCard';

function DashboardPage() {
    const { logout, userInfo } = useAuth();
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
    
    const refreshAllData = () => {
        return Promise.all([fetchSectorsAndStatuses(), fetchTasks()]);
    };
    
    useEffect(() => {
        setIsLoading(true);
        refreshAllData().finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        const isInitialLoad = tasks.length === 0 && sectors.length === 0;
        if (!isInitialLoad) { fetchTasks(); }
    }, [filters]);
    
    const handleAddTask = async (taskData) => { try { await api.post('/tarefas', taskData); toast.success("Tarefa adicionada com sucesso!"); refreshAllData(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao adicionar tarefa."); } };
    const handleUpdateTask = async (taskId, updatedData) => { try { await api.put(`/tarefas/${taskId}`, updatedData); if (!updatedData.status_id) { toast.success("Tarefa atualizada com sucesso!"); } const newTasks = await fetchTasks(); const newlyFetchedTask = newTasks.find(t => t.id === taskId); if (newlyFetchedTask) { setSelectedTask(newlyFetchedTask); } } catch (error) { toast.error(error.response?.data?.error || "Erro ao atualizar tarefa."); return Promise.reject(error); } };
    
    const handleUpdateTaskStatus = async (taskId, updateData) => {
        try {
            await api.put(`/tarefas/${taskId}`, updateData);
            await refreshAllData(); // Recarrega tudo para ver as automações
        } catch (err) {
            toast.error("Falha ao atualizar status.");
            refreshAllData(); // Recarrega para reverter qualquer estado inconsistente
        }
    };

    const handleDeleteTask = async (taskId) => { try { await api.delete(`/tarefas/${taskId}`); toast.success("Tarefa deletada com sucesso!"); refreshAllData(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao deletar tarefa."); } };
    const handleAcceptInvitation = () => { refreshAllData(); };

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
            <header className="main-header"><h1>Meu Gerenciador de Tarefas</h1><div className="header-controls">{userInfo?.funcaoGlobal === 'master' && ( <Link to="/automations" className="nav-link">Automações</Link> )}<InvitationsBell onAcceptInvitation={handleAcceptInvitation} /><button onClick={logout} className="logout-btn">Sair</button></div></header>
            <div className="main-controls">{(userInfo?.funcaoGlobal === 'master') && ( <button onClick={() => setIsSectorModalOpen(true)} className="manage-sectors-btn"> Gerenciar Setores </button> )}</div>
            <TaskFilter onFilterChange={handleFilterChange} />
            <div className="view-switcher"><button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Lista</button><button onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'active' : ''}>Quadro</button></div>
            <div className="sectors-container">{[...sectors].sort((a, b) => a.nome.localeCompare(b.nome)).map(sector => {
                const tasksForThisSector = tasksBySector[sector.id] || [];
                const sectorStatuses = statuses[sector.id] || [];
                const showSettings = sector.funcao === 'dono' || userInfo?.funcaoGlobal === 'master';
                return (
                    <section key={sector.id} className="sector-group">
                        <div className="sector-header"><div className="sector-title-controls"><button onClick={() => openTaskModal(sector)} className="add-task-btn">+Tarefa</button><h2>Setor: {sector.nome}</h2></div>{showSettings && (<button onClick={() => openSettingsModal(sector)} className="settings-btn" title="Configurações do setor">⚙️</button>)}</div>
                        {viewMode === 'list' ? ( <div className="task-list">...</div> ) : ( <BoardView tasks={tasksForThisSector} statuses={sectorStatuses} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} /> )}
                    </section>
                );
            })}
            </div>
            <SectorManager isOpen={isSectorModalOpen} onRequestClose={() => setIsSectorModalOpen(false)} onSectorsUpdate={refreshAllData} />
            <TaskModal isOpen={isTaskModalOpen} onRequestClose={closeTaskModal} onTaskAdd={handleAddTask} sector={selectedSector} />
            <TaskDetailModal isOpen={isDetailModalOpen} onRequestClose={closeDetailModal} task={selectedTask} sectors={sectors} statuses={statuses} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            <SettingsModal isOpen={isSettingsModalOpen} onRequestClose={closeSettingsModal} sector={sectorForSettings} onSettingsChange={refreshAllData} />
        </div>
    );
}

export default DashboardPage;*/





/*
import React, { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import SectorManager from '../components/SectorManager';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import SettingsModal from '../components/SettingsModal';
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
    
    const refreshAllData = () => { Promise.all([fetchSectorsAndStatuses(), fetchTasks()]); };
    useEffect(() => { refreshAllData(); }, []);
    useEffect(() => { const isInitialLoad = tasks.length === 0 && sectors.length === 0; if (!isInitialLoad) { fetchTasks(); } }, [filters]);
    
    const handleAddTask = async (taskData) => { try { await api.post('/tarefas', taskData); toast.success("Tarefa adicionada com sucesso!"); refreshAllData(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao adicionar tarefa."); } };
    const handleUpdateTask = async (taskId, updatedData) => { try { await api.put(`/tarefas/${taskId}`, updatedData); if (!updatedData.status_id) { toast.success("Tarefa atualizada com sucesso!"); } const newTasks = await fetchTasks(); const newlyFetchedTask = newTasks.find(t => t.id === taskId); if (newlyFetchedTask) { setSelectedTask(newlyFetchedTask); } } catch (error) { toast.error(error.response?.data?.error || "Erro ao atualizar tarefa."); return Promise.reject(error); } };
    const handleUpdateTaskStatus = (taskId, updateData) => {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
            const updatedTask = { ...taskToUpdate, ...updateData };
            if (updateData.status_id) {
                const newStatus = statuses[taskToUpdate.setor_id]?.find(s => s.id === updateData.status_id);
                if (newStatus) updatedTask.status_nome = newStatus.nome;
            }
            setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
            api.put(`/tarefas/${taskId}`, updateData).catch(err => {
                toast.error("Falha ao atualizar status.");
                fetchTasks();
            });
        }
    };
    const handleDeleteTask = async (taskId) => { try { await api.delete(`/tarefas/${taskId}`); toast.success("Tarefa deletada com sucesso!"); refreshAllData(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao deletar tarefa."); } };
    const handleAcceptInvitation = () => { refreshAllData(); };

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
            <div className="sectors-container">{[...sectors].sort((a, b) => a.nome.localeCompare(b.nome)).map(sector => {
                const tasksForThisSector = tasksBySector[sector.id] || [];
                const sectorStatuses = statuses[sector.id] || [];
                return (
                    <section key={sector.id} className="sector-group">
                        <div className="sector-header"><div className="sector-title-controls"><button onClick={() => openTaskModal(sector)} className="add-task-btn">+Tarefa</button><h2>Setor: {sector.nome}</h2></div>{(sector.funcao === 'dono' || useAuth().funcaoGlobal === 'master') && (<button onClick={() => openSettingsModal(sector)} className="settings-btn" title="Configurações do setor">⚙️</button>)}</div>
                        {viewMode === 'list' ? ( 
                            <div className="task-list">
                                <ul>{tasksForThisSector.map((task, index) => (<TaskCard key={task.id} task={task} index={index} onCardClick={openDetailModal} isDragDisabled={true} />))}</ul>
                            </div> 
                        ) : ( 
                            <BoardView 
                                tasks={tasksForThisSector} 
                                statuses={sectorStatuses} 
                                onCardClick={openDetailModal} 
                                onUpdateStatus={handleUpdateTaskStatus} 
                            /> 
                        )}
                    </section>
                );
            })}
            </div>
            <SettingsModal isOpen={isSettingsModalOpen} onRequestClose={closeSettingsModal} sector={sectorForSettings} onSettingsChange={refreshAllData} />
            <TaskDetailModal 
				isOpen={isDetailModalOpen} 
				onRequestClose={closeDetailModal} 
				task={selectedTask} 
				sectors={sectors}
				statuses={statuses}
				onUpdateTask={handleUpdateTask} 
				onDeleteTask={handleDeleteTask} 
			/>
            <TaskModal isOpen={isTaskModalOpen} onRequestClose={closeTaskModal} onTaskAdd={handleAddTask} sector={selectedSector} />
            <SectorManager isOpen={isSectorModalOpen} onRequestClose={() => setIsSectorModalOpen(false)} onSectorsUpdate={refreshAllData} />
        </div>
    );
}

export default DashboardPage;*/