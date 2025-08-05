import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './AutomationPage.css'; // Criaremos este arquivo de CSS

function AutomationPage() {
    const [regras, setRegras] = useState([]);
    const [setores, setSetores] = useState([]);
    const [statuses, setStatuses] = useState({});
    
    const [nomeRegra, setNomeRegra] = useState('');
    const [setorOrigemId, setSetorOrigemId] = useState('');
    const [statusGatilhoId, setStatusGatilhoId] = useState('');
    const [setorDestinoId, setSetorDestinoId] = useState('');
    const [templateDescricao, setTemplateDescricao] = useState('Tarefa gerada a partir de: {descricao_original}');

    const fetchAllData = async () => { try { const [regrasRes, setoresRes] = await Promise.all([ api.get('/regras_automacao'), api.get('/setores') ]); setRegras(regrasRes.data); setSetores(setoresRes.data); } catch (error) { toast.error("Falha ao carregar dados de automação."); } };
    useEffect(() => { fetchAllData(); }, []);
    
    useEffect(() => {
        const fetchStatusesForSector = async () => {
            if (setorOrigemId && !statuses[setorOrigemId]) {
                try { const res = await api.get(`/setores/${setorOrigemId}/status`); setStatuses(prev => ({ ...prev, [setorOrigemId]: res.data })); } catch (error) { toast.error("Falha ao carregar status do setor de origem."); }
            }
        };
        fetchStatusesForSector();
    }, [setorOrigemId]);

    const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('/regras_automacao', { nome_regra: nomeRegra, setor_origem_id: setorOrigemId, status_gatilho_id: statusGatilhoId, setor_destino_id: setorDestinoId, template_descricao: templateDescricao }); toast.success("Regra de automação criada com sucesso!"); fetchAllData(); setNomeRegra(''); setSetorOrigemId(''); setStatusGatilhoId(''); setSetorDestinoId(''); } catch (error) { toast.error(error.response?.data?.error || "Falha ao criar regra."); } };
    const handleDelete = async (regraId) => { if (window.confirm("Tem certeza?")) { try { await api.delete(`/regras_automacao/${regraId}`); toast.success("Regra deletada!"); setRegras(regras.filter(r => r.id !== regraId)); } catch (error) { toast.error(error.response?.data?.error || "Falha ao deletar regra."); } } };
    
    const statusOptions = statuses[setorOrigemId] || [];

    return (
        <div className="container automation-page">
            <header className="page-header"><h1>Gerenciamento de Automações</h1><Link to="/app" className="back-link">Voltar ao Dashboard</Link></header>
            <div className="automation-form-container card">
                <h2>Criar Nova Regra de Automação</h2>
                <form onSubmit={handleSubmit} className="automation-form">
                    <div className="form-row"><label>Nome da Regra:</label><input type="text" value={nomeRegra} onChange={e => setNomeRegra(e.target.value)} placeholder="Ex: Mover para Estoque" required /></div>
                    <div className="form-row"><label>QUANDO uma tarefa no setor...</label><select value={setorOrigemId} onChange={e => setSetorOrigemId(e.target.value)} required><option value="" disabled>Selecione o setor de origem</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}</select></div>
                    <div className="form-row"><label>...for movida para a coluna...</label><select value={statusGatilhoId} onChange={e => setStatusGatilhoId(e.target.value)} required disabled={!setorOrigemId}><option value="" disabled>Selecione a coluna gatilho</option>{statusOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}</select></div>
                    <div className="form-row"><label>ENTÃO criar uma nova tarefa no setor...</label><select value={setorDestinoId} onChange={e => setSetorDestinoId(e.target.value)} required><option value="" disabled>Selecione o setor de destino</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}</select></div>
                    <div className="form-row"><label>Com a descrição:</label><textarea value={templateDescricao} onChange={e => setTemplateDescricao(e.target.value)} placeholder="Use {descricao_original} para usar o texto da tarefa original." /></div>
                    <button type="submit" className="auth-button">Criar Regra</button>
                </form>
            </div>
            <div className="automation-list-container card">
                <h2>Regras Atuais</h2>
                <ul className="rules-list">{regras.map(regra => (<li key={regra.id}><div><strong>{regra.nome_regra}</strong><p>Quando: <span>{regra.setor_origem_nome}</span> → <span>{regra.status_gatilho_nome}</span></p><p>Então: Criar tarefa em <span>{regra.setor_destino_nome}</span></p></div><button onClick={() => handleDelete(regra.id)} className="delete-rule-btn">🗑️</button></li>))}</ul>
            </div>
        </div>
    );
}

export default AutomationPage;