// Arquivo: gerenciador-tarefas-web/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

import SectorManager from '../components/SectorManager';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
import MemberManagerModal from '../components/MemberManagerModal';
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
    const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const [sectorForMembers, setSectorForMembers] = useState(null);

    // FUNÇÃO fetchTasks MODIFICADA
    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/tarefas', { params: filters });
            setTasks(response.data);
            return response.data; // Retorna os dados para quem chamou
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
            if (error.response?.status !== 401) toast.error("Falha ao carregar tarefas.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSectors = async () => { try { const response = await api.get('/setores'); setSectors(response.data); } catch (error) { console.error("Erro ao buscar setores:", error); } };
    
    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            // Promise.all executa as buscas em paralelo
            await Promise.all([fetchSectors(), fetchTasks()]);
            setIsLoading(false);
        };
        initialLoad();
    }, []); // Roda apenas na primeira montagem

    // Roda apenas quando os filtros mudam, evitando a busca dupla inicial
    useEffect(() => {
        const isInitialLoad = tasks.length === 0 && sectors.length === 0;
        if (!isInitialLoad) {
            fetchTasks();
        }
    }, [filters]);

    const handleAddTask = async (taskData) => { try { await api.post('/tarefas', taskData); toast.success("Tarefa adicionada com sucesso!"); fetchTasks(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao adicionar tarefa."); } };
    
    // FUNÇÃO DE ATUALIZAÇÃO CORRIGIDA
    const handleUpdateTask = async (taskId, updatedData) => {
        try {
            await api.put(`/tarefas/${taskId}`, updatedData);
            
            const originalTask = tasks.find(task => task.id === taskId);
            // Mostra o toast apenas para edições manuais (não drag-and-drop)
            if (!originalTask || !updatedData.status || updatedData.status === originalTask.status) {
                toast.success("Tarefa atualizada com sucesso!");
            }
            
            // 1. Chama o fetchTasks e ESPERA pela nova lista de tarefas
            const newTasks = await fetchTasks();
            
            // 2. Encontra a versão 100% atualizada da nossa tarefa nessa nova lista
            const newlyFetchedTask = newTasks.find(t => t.id === taskId);
            
            // 3. Atualiza o estado que alimenta o modal com essa versão fresca
            if (newlyFetchedTask) {
                setSelectedTask(newlyFetchedTask);
            }

        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao atualizar tarefa.");
            // Propaga o erro para que o modal saiba que a operação falhou
            return Promise.reject(error);
        }
    };
    
    const handleUpdateTaskStatus = (taskId, newStatus) => {
        const taskToUpdate = tasks.find(task => task.id === taskId);
        if (taskToUpdate) {
            // Atualiza a UI otimisticamente para o drag-and-drop ser rápido
            const updatedTask = { ...taskToUpdate, status: newStatus };
            setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
            // Envia a atualização para a API em segundo plano
            api.put(`/tarefas/${taskId}`, { status: newStatus }).catch(err => {
                toast.error("Falha ao atualizar status.");
                fetchTasks(); // Reverte em caso de erro
            });
        }
    };

    const handleDeleteTask = async (taskId) => { try { await api.delete(`/tarefas/${taskId}`); toast.success("Tarefa deletada com sucesso!"); fetchTasks(); } catch (error) { toast.error(error.response?.data?.error || "Erro ao deletar tarefa."); } };
    const handleSectorsUpdate = (type, sectorName) => { fetchSectors(); if(type === 'add') { toast.success(`Setor "${sectorName}" adicionado!`); } if(type === 'delete') { toast.success(`Setor deletado com sucesso!`); } };
    const handleAcceptInvitation = () => { fetchSectors(); };

    const handleFilterChange = (filterName, value) => { setFilters(prevFilters => ({ ...prevFilters, [filterName]: value })); };
    const openTaskModal = (sector) => { setSelectedSector(sector); setIsTaskModalOpen(true); };
    const closeTaskModal = () => { setIsTaskModalOpen(false); setSelectedSector(null); };
    const openDetailModal = (task) => { setSelectedTask(task); setIsDetailModalOpen(true); };
    const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedTask(null); };
    const openMemberModal = (sector) => { setSectorForMembers(sector); setIsMemberModalOpen(true); };
    const closeMemberModal = () => { setIsMemberModalOpen(false); setSectorForMembers(null); };
    const tasksBySector = tasks.reduce((acc, task) => { const sectorName = task.setor || 'Sem Setor'; if (!acc[sectorName]) { acc[sectorName] = []; } acc[sectorName].push(task); return acc; }, {});

    return (
        <div className="container">
            {isLoading && (<div className="loading-overlay"><ClipLoader color={"#007bff"} size={80} /></div>)}
            <header className="main-header"><h1>Meu Gerenciador de Tarefas</h1><div className="header-controls"><InvitationsBell onAcceptInvitation={handleAcceptInvitation} /><button onClick={logout} className="logout-btn">Sair</button></div></header>
            <div className="main-controls"><button onClick={() => setIsSectorModalOpen(true)} className="manage-sectors-btn">Gerenciar Setores</button></div>
            <TaskFilter onFilterChange={handleFilterChange} />
            <div className="view-switcher"><button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Lista</button><button onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'active' : ''}>Quadro</button></div>
            <div className="sectors-container">{[...sectors].sort((a, b) => a.nome.localeCompare(b.nome)).map(sector => { const tasksForThisSector = tasksBySector[sector.nome] || []; return (<section key={sector.id} className="sector-group"><div className="sector-header"><div className="sector-title-controls"><button onClick={() => openTaskModal(sector)} className="add-task-btn">+Tarefa</button><h2>Setor: {sector.nome}</h2></div>{sector.funcao === 'dono' && (<button onClick={() => openMemberModal(sector)} className="settings-btn" title="Gerenciar membros">⚙️</button>)}</div>{viewMode === 'list' ? (<div className="task-list"><ul>{tasksForThisSector.map((task, index) => (<TaskCard key={task.id} task={task} index={index} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} isDragDisabled={true} />))}</ul></div>) : (<BoardView tasks={tasksForThisSector} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} />)}</section>); })}</div>
            <SectorManager isOpen={isSectorModalOpen} onRequestClose={() => setIsSectorModalOpen(false)} onSectorsUpdate={handleSectorsUpdate} />
            <TaskModal isOpen={isTaskModalOpen} onRequestClose={closeTaskModal} onTaskAdd={handleAddTask} sector={selectedSector} />
            <TaskDetailModal isOpen={isDetailModalOpen} onRequestClose={closeDetailModal} task={selectedTask} sectors={sectors} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
        </div>
    );
}

export default DashboardPage;