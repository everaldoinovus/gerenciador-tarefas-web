import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

import SectorManager from '../components/SectorManager';
import TaskModal from '../components/TaskModal';
import TaskDetailModal from '../components/TaskDetailModal';
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
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedSector, setSelectedSector] = useState(null);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.responsavel) params.append('responsavel', filters.responsavel);
            if (filters.data) params.append('data', filters.data);
            const response = await axios.get('http://localhost:3333/tarefas', { params });
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
            const response = await axios.get('http://localhost:3333/setores');
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

    const handleAddTask = async (taskData) => {
        try {
            await axios.post('http://localhost:3333/tarefas', taskData);
            toast.success("Tarefa adicionada com sucesso!");
            fetchTasks();
        } catch (error) {
            toast.error("Erro ao adicionar tarefa.");
        }
    };

    const handleUpdateTask = async (taskId, updatedData) => {
        try {
            const originalTask = tasks.find(task => task.id === taskId);
            if (!originalTask) return;
            const finalData = { ...originalTask, ...updatedData };
            await axios.put(`http://localhost:3333/tarefas/${taskId}`, finalData);
            if (updatedData.status === originalTask.status || !updatedData.status) {
                toast.success("Tarefa atualizada com sucesso!");
            }
            setTasks(tasks.map(task => task.id === taskId ? finalData : task));
            if (selectedTask && selectedTask.id === taskId) {
                setSelectedTask(finalData);
            }
        } catch (error) {
            toast.error("Erro ao atualizar tarefa.");
        }
    };

    const handleUpdateTaskStatus = (taskId, newStatus) => {
        handleUpdateTask(taskId, { status: newStatus });
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axios.delete(`http://localhost:3333/tarefas/${taskId}`);
            toast.success("Tarefa deletada com sucesso!");
            fetchTasks();
        } catch (error) {
            toast.error("Erro ao deletar tarefa.");
        }
    };

    const handleSectorsUpdate = (type, sectorName) => {
        fetchSectors();
        if(type === 'add') { toast.success(`Setor "${sectorName}" adicionado!`); }
        if(type === 'delete') { toast.success(`Setor deletado com sucesso!`); }
    };

    const handleFilterChange = (filterName, value) => { setFilters(prevFilters => ({ ...prevFilters, [filterName]: value })); };
    const openTaskModal = (sector) => { setSelectedSector(sector); setIsTaskModalOpen(true); };
    const closeTaskModal = () => { setIsTaskModalOpen(false); setSelectedSector(null); };
    const openDetailModal = (task) => { setSelectedTask(task); setIsDetailModalOpen(true); };
    const closeDetailModal = () => { setIsDetailModalOpen(false); setSelectedTask(null); };
    const tasksBySector = tasks.reduce((acc, task) => { const sectorName = task.setor || 'Sem Setor'; if (!acc[sectorName]) { acc[sectorName] = []; } acc[sectorName].push(task); return acc; }, {});

    return (
        <div className="container">
            {isLoading && (<div className="loading-overlay"><ClipLoader color={"#007bff"} size={80} /></div>)}
            <header className="main-header">
                <h1>Meu Gerenciador de Tarefas</h1>
                <button onClick={logout} className="logout-btn">Sair</button>
            </header>
            <div className="main-controls"><button onClick={() => setIsSectorModalOpen(true)} className="manage-sectors-btn">Gerenciar Setores</button></div>
            <TaskFilter onFilterChange={handleFilterChange} />
            <div className="view-switcher"><button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>Lista</button><button onClick={() => setViewMode('board')} className={viewMode === 'board' ? 'active' : ''}>Quadro</button></div>
            <div className="sectors-container">{[...sectors].sort((a, b) => a.nome.localeCompare(b.nome)).map(sector => { const tasksForThisSector = tasksBySector[sector.nome] || []; return (<section key={sector.id} className="sector-group"><div className="sector-header"><button onClick={() => openTaskModal(sector)} className="add-task-btn">+Tarefa</button><h2>Setor: {sector.nome}</h2></div>{viewMode === 'list' ? (<div className="task-list"><ul>{tasksForThisSector.map(task => (<TaskCard key={task.id} task={task} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} />))}</ul></div>) : (<BoardView tasks={tasksForThisSector} onCardClick={openDetailModal} onUpdateStatus={handleUpdateTaskStatus} />)}</section>); })}</div>
            <SectorManager isOpen={isSectorModalOpen} onRequestClose={() => setIsSectorModalOpen(false)} onSectorsUpdate={handleSectorsUpdate} />
            <TaskModal isOpen={isTaskModalOpen} onRequestClose={closeTaskModal} onTaskAdd={handleAddTask} sector={selectedSector} />
            <TaskDetailModal isOpen={isDetailModalOpen} onRequestClose={closeDetailModal} task={selectedTask} sectors={sectors} onUpdateTask={handleUpdateTask} onDeleteTask={handleDeleteTask} />
        </div>
    );
}

export default DashboardPage;