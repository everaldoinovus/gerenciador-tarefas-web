import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './AutomationPage.css';

function AutomationPage() {
    const [regras, setRegras] = useState([]);
    const [setores, setSetores] = useState([]);
    const [statuses, setStatuses] = useState({});
    
    const [nomeRegra, setNomeRegra] = useState('');
    const [setorOrigemId, setSetorOrigemId] = useState('');
    const [statusGatilhoId, setStatusGatilhoId] = useState('');
    const [acoes, setAcoes] = useState([ { setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}', status_retorno_sucesso_id: '', status_retorno_falha_id: '' } ]);

    const fetchAllData = async () => { try { const [regrasRes, setoresRes] = await Promise.all([ api.get('/regras_automacao'), api.get('/setores') ]); setRegras(regrasRes.data); setSetores(setoresRes.data); const allSectors = setoresRes.data; const statusesPromises = allSectors.map(s => api.get(`/setores/${s.id}/status`)); const statusesResults = await Promise.all(statusesPromises); const statusesMap = {}; statusesResults.forEach((result, index) => { const sectorId = allSectors[index].id; statusesMap[sectorId] = result.data; }); setStatuses(statusesMap); } catch (error) { toast.error("Falha ao carregar dados de automação."); } };
    useEffect(() => { fetchAllData(); }, []);

    const handleAcaoChange = (index, field, value) => { const novasAcoes = [...acoes]; novasAcoes[index][field] = value; setAcoes(novasAcoes); };
    const addAcao = () => { setAcoes([...acoes, { setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}', status_retorno_sucesso_id: '', status_retorno_falha_id: '' }]); };
    const removeAcao = (index) => { const novasAcoes = acoes.filter((_, i) => i !== index); setAcoes(novasAcoes); };

    const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('/regras_automacao', { nome_regra: nomeRegra, setor_origem_id: setorOrigemId, status_gatilho_id: statusGatilhoId, acoes: acoes }); toast.success("Regra de automação criada com sucesso!"); fetchAllData(); setNomeRegra(''); setSetorOrigemId(''); setStatusGatilhoId(''); setAcoes([{ setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}', status_retorno_sucesso_id: '', status_retorno_falha_id: '' }]); } catch (error) { toast.error(error.response?.data?.error || "Falha ao criar regra."); } };
    const handleDelete = async (regraId) => { if (window.confirm("Tem certeza?")) { try { await api.delete(`/regras_automacao/${regraId}`); toast.success("Regra deletada!"); setRegras(regras.filter(r => r.id !== regraId)); } catch (error) { toast.error(error.response?.data?.error || "Falha ao deletar regra."); } } };
    
    const statusGatilhoOptions = statuses[setorOrigemId] || [];

    return (
        <div className="container automation-page">
            <header className="page-header"><h1>Gerenciamento de Automações</h1><Link to="/app" className="back-link">Voltar ao Dashboard</Link></header>
            <div className="automation-form-container card">
                <h2>Criar Nova Regra de Automação</h2>
                <form onSubmit={handleSubmit} className="automation-form">
                    <div className="form-row"><label>Nome da Regra:</label><input type="text" value={nomeRegra} onChange={e => setNomeRegra(e.target.value)} placeholder="Ex: Venda -> Análise de Crédito" required /></div>
                    <div className="trigger-section">
                        <h4>QUANDO... (Gatilho)</h4>
                        <div className="form-row"><label>...uma tarefa no setor...</label><select value={setorOrigemId} onChange={e => { setSetorOrigemId(e.target.value); setStatusGatilhoId(''); }} required><option value="" disabled>Selecione o setor de origem</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}</select></div>
                        <div className="form-row"><label>...for movida para a coluna...</label><select value={statusGatilhoId} onChange={e => setStatusGatilhoId(e.target.value)} required disabled={!setorOrigemId}><option value="" disabled>Selecione a coluna gatilho</option>{statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}</select></div>
                    </div>
                    <div className="actions-section">
                        <h4>ENTÃO... (Ações)</h4>
                        {acoes.map((acao, index) => {
                            const statusRetornoOptions = statuses[setorOrigemId] || [];
                            return (
                                <div key={index} className="action-row card">
                                    <div className="action-header"><span>Ação {index + 1}</span>{acoes.length > 1 && ( <button type="button" onClick={() => removeAcao(index)} className="remove-action-btn" title="Remover Ação">×</button> )}</div>
                                    <div className="form-row"><label>Criar tarefa em...</label><select value={acao.setor_destino_id} onChange={(e) => handleAcaoChange(index, 'setor_destino_id', e.target.value)} required><option value="" disabled>Selecione o destino</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}</select></div>
                                    <div className="form-row"><label>Com a descrição:</label><textarea value={acao.template_descricao} onChange={(e) => handleAcaoChange(index, 'template_descricao', e.target.value)} /></div>
                                    <div className="form-row return-status"><label>Se movida para "Aprovado", mover original para...</label><select value={acao.status_retorno_sucesso_id} onChange={(e) => handleAcaoChange(index, 'status_retorno_sucesso_id', e.target.value)} disabled={!setorOrigemId}><option value="">-- Não mover --</option>{statusRetornoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))} </select></div>
                                    <div className="form-row return-status"><label>Se movida para "Negado", mover original para...</label><select value={acao.status_retorno_falha_id} onChange={(e) => handleAcaoChange(index, 'status_retorno_falha_id', e.target.value)} disabled={!setorOrigemId}><option value="">-- Não mover --</option>{statusRetornoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))} </select></div>
                                </div>
                            )
                        })}
                        <button type="button" onClick={addAcao} className="add-action-btn">+ Adicionar outra ação</button>
                    </div>
                    <button type="submit" className="auth-button">Criar Regra</button>
                </form>
            </div>
            <div className="automation-list-container card"><h2>Regras Atuais</h2><ul className="rules-list">{regras.map(regra => (<li key={regra.id}><div className="rule-details"><strong>{regra.nome_regra}</strong><p className="rule-trigger">Quando: <span>{regra.setor_origem_nome}</span> → <span>{regra.status_gatilho_nome}</span></p><div className="rule-actions"><p>Então:</p><ul>{regra.acoes.map(acao => (<li key={acao.id}>Criar tarefa em <span>{acao.setor_destino_nome}</span></li>))}</ul></div></div><button onClick={() => handleDelete(regra.id)} className="delete-rule-btn">🗑️</button></li>))}</ul></div>
        </div>
    );
}

export default AutomationPage;

/*import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './AutomationPage.css';

function AutomationPage() {
    const [regras, setRegras] = useState([]);
    const [setores, setSetores] = useState([]);
    const [statuses, setStatuses] = useState({});
    
    const [nomeRegra, setNomeRegra] = useState('');
    const [setorOrigemId, setSetorOrigemId] = useState('');
    const [statusGatilhoId, setStatusGatilhoId] = useState('');
    const [acoes, setAcoes] = useState([ { setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}' } ]);

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

    const handleAcaoChange = (index, field, value) => { const novasAcoes = [...acoes]; novasAcoes[index][field] = value; setAcoes(novasAcoes); };
    const addAcao = () => { setAcoes([...acoes, { setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}' }]); };
    const removeAcao = (index) => { const novasAcoes = acoes.filter((_, i) => i !== index); setAcoes(novasAcoes); };

    const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('/regras_automacao', { nome_regra: nomeRegra, setor_origem_id: setorOrigemId, status_gatilho_id: statusGatilhoId, acoes: acoes }); toast.success("Regra de automação criada com sucesso!"); fetchAllData(); setNomeRegra(''); setSetorOrigemId(''); setStatusGatilhoId(''); setAcoes([{ setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}' }]); } catch (error) { toast.error(error.response?.data?.error || "Falha ao criar regra."); } };
    const handleDelete = async (regraId) => { if (window.confirm("Tem certeza?")) { try { await api.delete(`/regras_automacao/${regraId}`); toast.success("Regra deletada!"); setRegras(regras.filter(r => r.id !== regraId)); } catch (error) { toast.error(error.response?.data?.error || "Falha ao deletar regra."); } } };
    
    const statusOptions = statuses[setorOrigemId] || [];

    return (
        <div className="container automation-page">
            <header className="page-header"><h1>Gerenciamento de Automações</h1><Link to="/app" className="back-link">Voltar ao Dashboard</Link></header>
            <div className="automation-form-container card">
                <h2>Criar Nova Regra de Automação</h2>
                <form onSubmit={handleSubmit} className="automation-form">
                    <div className="form-row"><label>Nome da Regra:</label><input type="text" value={nomeRegra} onChange={e => setNomeRegra(e.target.value)} placeholder="Ex: Mover para Estoque e Produção" required /></div>
                    <div className="trigger-section">
                        <h4>QUANDO... (Gatilho)</h4>
                        <div className="form-row"><label>...uma tarefa no setor...</label><select value={setorOrigemId} onChange={e => { setSetorOrigemId(e.target.value); setStatusGatilhoId(''); }} required><option value="" disabled>Selecione o setor de origem</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}</select></div>
                        <div className="form-row"><label>...for movida para a coluna...</label><select value={statusGatilhoId} onChange={e => setStatusGatilhoId(e.target.value)} required disabled={!setorOrigemId}><option value="" disabled>Selecione a coluna gatilho</option>{statusOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}</select></div>
                    </div>
                    <div className="actions-section">
                        <h4>ENTÃO... (Ações)</h4>
                        {acoes.map((acao, index) => (
                            <div key={index} className="action-row card">
                                <div className="action-header">
                                    <span>Ação {index + 1}</span>
                                    {acoes.length > 1 && ( <button type="button" onClick={() => removeAcao(index)} className="remove-action-btn" title="Remover Ação">×</button> )}
                                </div>
                                <div className="form-row"><label>Criar tarefa em...</label><select value={acao.setor_destino_id} onChange={(e) => handleAcaoChange(index, 'setor_destino_id', e.target.value)} required><option value="" disabled>Selecione o destino</option>{setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}</select></div>
                                <div className="form-row"><label>Com a descrição:</label><textarea value={acao.template_descricao} onChange={(e) => handleAcaoChange(index, 'template_descricao', e.target.value)} /></div>
                            </div>
                        ))}
                        <button type="button" onClick={addAcao} className="add-action-btn">+ Adicionar outra ação</button>
                    </div>
                    <button type="submit" className="auth-button">Criar Regra com {acoes.length} Ação(ões)</button>
                </form>
            </div>
            <div className="automation-list-container card">
                <h2>Regras Atuais</h2>
                <ul className="rules-list">
                    {regras.map(regra => (
                        <li key={regra.id}>
                            <div className="rule-details">
                                <strong>{regra.nome_regra}</strong>
                                <p className="rule-trigger">Quando: <span>{regra.setor_origem_nome}</span> → <span>{regra.status_gatilho_nome}</span></p>
                                <div className="rule-actions">
                                    <p>Então:</p>
                                    <ul>{regra.acoes.map(acao => (<li key={acao.id}>Criar tarefa em <span>{acao.setor_destino_nome}</span></li>))}</ul>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(regra.id)} className="delete-rule-btn">🗑️</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AutomationPage;*/


/*
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

export default AutomationPage;*/