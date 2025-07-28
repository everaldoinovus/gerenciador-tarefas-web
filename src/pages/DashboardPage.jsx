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
    const [isLoading, setIsLoading] = useState(true);
    const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);
    const [sectorForMembers, setSectorForMembers] = useState(null);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/tarefas', { params: filters });
            setTasks(response.data);
        } catch (error) {
            console.error("Erro ao buscar tarefas:", error);
            if (error.response?.status !== 401) toast.error("Falha ao carregar tarefas.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSectors = async () => {
        try {
            const response = await api.get('/setores');
            setSectors(response.data);
        } catch (error) {
            console.error("Erro ao buscar setores:", error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [filters]);

    useEffect(() => {
        fetchSectors();
    }, []);

    // ===== FUNÇÕES RESTAURADAS =====
    const handleAddTask = async (taskData) => {
        try {
            await api.post('/tarefas', taskData);
            toast.success("Tarefa adicionada com sucesso!");
            fetchTasks(); // Recarrega a lista de tarefas
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao adicionar tarefa.");
        }
    };

    const handleUpdateTask = async (taskId, updatedData) => {
        try {
            const originalTask = tasks.find(task => task.id === taskId);
            if (!originalTask) return;
            const finalData = { ...originalTask, ...updatedData };
            await api.put(`/tarefas/${taskId}`, finalData);
            if (updatedData.status === originalTask.status || !updatedData.status) {
                toast.success("Tarefa atualizada com sucesso!");
            }
            setTasks(tasks.map(task => task.id === taskId ? finalData : task));
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(finalData);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao atualizar tarefa.");
        }
    };
    
    const handleDeleteTask = async (taskId) => {
        try {
            await api.delete(`/tarefas/${taskId}`);
            toast.success("Tarefa deletada com sucesso!");
            fetchTasks();
        } catch (error) {
            toast.error(error.response?.data?.error || "Erro ao deletar tarefa.");
        }
    };
    // ==================================

    const handleUpdateTaskStatus = (taskId, newStatus) => {
        handleUpdateTask(taskId, { status: newStatus });
    };

    const handleSectorsUpdate = (type, sectorName) => {
        fetchSectors();
        if(type === 'add') { toast.success(`Setor "${sectorName}" adicionado!`); }
        if(type === 'delete') { toast.success(`Setor deletado com sucesso!`); }
    };

    const handleAcceptInvitation = () => {
        fetchSectors();
    };

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
            <header className="main-header">
                <h1>Meu Gerenciador de Tarefas</h1>
                <div className="header-controls">
                  <InvitationsBell onAcceptInvitation={handleAcceptInvitation} />
                  <button onClick={logout} className="logout-btn">Sair</button>
                </div>
            </header>
            <div className="main-controls"><button onClick={() => setIsSectorModalOpen(true)} className="manage-sectors-btn">Gerenciar Setores</button></div>
            <TaskFilter onFilterChange={handleFilterChange} />
            <div className="view-switcher"><button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Lista</button><button onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'active' : ''}>Quadro</button></div>
            <div className="sectors-container">{[...sectors].sort((a, b) => a.nome.localeCompare(b.nome)).map(sector => { const tasksForThisSector = tasksBySector[sector.nome] || []; return (<section key={sector.id} className="sector-group"><div className="sector-header"><div className="sector-title-controls"><button onClick={() => openTaskModal(sector)} className="add-task-btn">+Tarefa</button><h2>Setor: {sector.nome}</h2></div>{sector.funcao === 'dono' && (<button onClick={() => openMemberModal(sector)} className="settings-btn" title="Gerenciar membros">⚙️</button>)}</div>{viewMode === 'list' ? (<div className="task-list"><ul>{tasksForThisSector.map((task, index) => (<TaskCard key={task.id} task={task} index={index} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} isDragDisabled={true} />))}</ul></div>) : (<BoardView tasks={tasksForThisSector} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} />)}</section>); })}</div>
            <SectorManager isOpen={isSectorModalOpen} onRequestClose={() => setIsSectorModalOpen(false)} onSectorsUpdate={handleSectorsUpdate} />
            <TaskModal isOpen={isTaskModalOpen} onRequestClose={closeTaskModal} onTaskAdd={handleAddTask} sector={selectedSector} />
            <TaskDetailModal isOpen={isDetailModalOpen} onRequestClose={closeDetailModal} task={selectedTask} sectors={sectors} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
            <MemberManagerModal isOpen={isMemberModalOpen} onRequestClose={closeMemberModal} sector={sectorForMembers} />
        </div>
    );
}

export default DashboardPage;