// Arquivo: AutomationPage.jsx - VERSÃO FINAL COM CHECKBOX DE FEEDBACK

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './AutomationPage.css';

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
    </svg>
);

function AutomationPage() {
    const [regras, setRegras] = useState([]);
    const [setores, setSetores] = useState([]);
    const [statuses, setStatuses] = useState({});
    
    const [nomeRegra, setNomeRegra] = useState('');
    const [setorOrigemId, setSetorOrigemId] = useState('');
    const [statusGatilhoId, setStatusGatilhoId] = useState('');
    
    const [acoes, setAcoes] = useState([
        { 
            setor_destino_id: '', 
            template_descricao: 'Gerado a partir de: {descricao_original}', 
            status_retorno_sucesso_id: '', 
            status_retorno_falha_id: '',
            tipo_prazo: 'nenhum',
            valor_prazo: 5,
            ativar_feedback_analise: false
        }
    ]);

    const fetchAllData = async () => { try { const [regrasRes, setoresRes] = await Promise.all([ api.get('/regras_automacao'), api.get('/setores') ]); setRegras(regrasRes.data); setSetores(setoresRes.data); const allSectors = setoresRes.data; const statusesPromises = allSectors.map(s => api.get(`/setores/${s.id}/status`)); const statusesResults = await Promise.all(statusesPromises); const statusesMap = {}; statusesResults.forEach((result, index) => { const sectorId = allSectors[index].id; statusesMap[sectorId] = result.data; }); setStatuses(statusesMap); } catch (error) { toast.error("Falha ao carregar dados de automação."); } };
    useEffect(() => { fetchAllData(); }, []);

    const handleAcaoChange = (index, field, value) => {
        const novasAcoes = [...acoes];
        const eventValue = value.target ? (value.target.type === 'checkbox' ? value.target.checked : value.target.value) : value;
        novasAcoes[index][field] = eventValue;
        setAcoes(novasAcoes);
    };
    
    const addAcao = () => { 
        setAcoes([...acoes, { 
            setor_destino_id: '', 
            template_descricao: 'Gerado a partir de: {descricao_original}', 
            status_retorno_sucesso_id: '', 
            status_retorno_falha_id: '',
            tipo_prazo: 'nenhum',
            valor_prazo: 5,
            ativar_feedback_analise: false
        }]); 
    };
    
    const removeAcao = (index) => { const novasAcoes = acoes.filter((_, i) => i !== index); setAcoes(novasAcoes); };

    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        try { 
            await api.post('/regras_automacao', { nome_regra: nomeRegra, setor_origem_id: setorOrigemId, status_gatilho_id: statusGatilhoId, acoes: acoes }); 
            toast.success("Regra de automação criada com sucesso!"); 
            fetchAllData(); 
            setNomeRegra(''); 
            setSetorOrigemId(''); 
            setStatusGatilhoId(''); 
            setAcoes([
                { 
                    setor_destino_id: '', 
                    template_descricao: 'Gerado a partir de: {descricao_original}', 
                    status_retorno_sucesso_id: '', 
                    status_retorno_falha_id: '',
                    tipo_prazo: 'nenhum',
                    valor_prazo: 5,
                    ativar_feedback_analise: false
                }
            ]); 
        } catch (error) { 
            toast.error(error.response?.data?.error || "Falha ao criar regra."); 
        } 
    };
    
    const handleDelete = async (regraId) => { if (window.confirm("Tem certeza?")) { try { await api.delete(`/regras_automacao/${regraId}`); toast.success("Regra deletada!"); setRegras(regras.filter(r => r.id !== regraId)); } catch (error) { toast.error(error.response?.data?.error || "Falha ao deletar regra."); } } };
    
    const statusGatilhoOptions = statuses[setorOrigemId] || [];

    return (
        <div className="automation-page">
            <header className="page-header">
                <h1>Gerenciamento de Automações</h1>
                <Link to="/app" className="btn btn-secondary">Voltar ao Dashboard</Link>
            </header>
            
            <div className="automation-layout">
                <div className="form-column">
                    <form onSubmit={handleSubmit} className="automation-form-card">
                        <h2>Criar Nova Regra</h2>

                        <div className="form-step">
                            <h3><span>1</span> Dê um nome para a regra</h3>
                            <input type="text" value={nomeRegra} onChange={e => setNomeRegra(e.target.value)} placeholder="Ex: Enviar contrato para o Jurídico" required />
                        </div>

                        <div className="form-step">
                            <h3><span>2</span> Defina o gatilho (QUANDO...)</h3>
                            <div className="form-group">
                                <label>Uma tarefa no setor:</label>
                                <select value={setorOrigemId} onChange={e => { setSetorOrigemId(e.target.value); setStatusGatilhoId(''); }} required>
                                    <option value="" disabled>Selecione um setor...</option>
                                    {setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>For movida para a coluna:</label>
                                <select value={statusGatilhoId} onChange={e => setStatusGatilhoId(e.target.value)} required disabled={!setorOrigemId}>
                                    <option value="" disabled>Selecione uma coluna...</option>
                                    {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="form-step">
                            <h3><span>3</span> Configure as ações (ENTÃO...)</h3>
                            {acoes.map((acao, index) => (
                                <div key={index} className="action-card">
                                    <div className="action-header">
                                        <h4>Ação {index + 1}</h4>
                                        {acoes.length > 1 && (
                                            <button type="button" onClick={() => removeAcao(index)} className="btn-icon" title="Remover Ação">×</button>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Criar uma nova tarefa no setor:</label>
                                        <select value={acao.setor_destino_id} onChange={(e) => handleAcaoChange(index, 'setor_destino_id', e)} required>
                                            <option value="" disabled>Selecione o destino...</option>
                                            {setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Com a descrição (use {`{variáveis}`}):</label>
                                        <textarea value={acao.template_descricao} onChange={(e) => handleAcaoChange(index, 'template_descricao', e)} rows="3" />
                                    </div>
                                    
                                    <div className="feedback-group">
                                        <input 
                                            type="checkbox" 
                                            id={`feedback-${index}`}
                                            checked={acao.ativar_feedback_analise}
                                            onChange={(e) => handleAcaoChange(index, 'ativar_feedback_analise', e)}
                                        />
                                        <label htmlFor={`feedback-${index}`}>
                                            Ativar feedback de "em análise" na tarefa original
                                        </label>
                                    </div>
                                    
                                    <div className="deadline-group">
                                        <label className="group-label">Data de Conclusão da Nova Tarefa:</label>
                                        <div className="radio-group">
                                            <div className="radio-option">
                                                <input type="radio" id={`nenhum-${index}`} name={`prazo-${index}`} value="nenhum" checked={acao.tipo_prazo === 'nenhum'} onChange={(e) => handleAcaoChange(index, 'tipo_prazo', e)} />
                                                <label htmlFor={`nenhum-${index}`}>Não definir data</label>
                                            </div>
                                            <div className="radio-option">
                                                <input type="radio" id={`copiar-${index}`} name={`prazo-${index}`} value="copiar" checked={acao.tipo_prazo === 'copiar'} onChange={(e) => handleAcaoChange(index, 'tipo_prazo', e)} />
                                                <label htmlFor={`copiar-${index}`}>Usar a mesma data da tarefa original</label>
                                            </div>
                                            <div className="radio-option">
                                                <input type="radio" id={`dias-${index}`} name={`prazo-${index}`} value="dias" checked={acao.tipo_prazo === 'dias'} onChange={(e) => handleAcaoChange(index, 'tipo_prazo', e)} />
                                                <label htmlFor={`dias-${index}`}>Definir prazo de</label>
                                                <input 
                                                    type="number" 
                                                    className="days-input" 
                                                    value={acao.valor_prazo} 
                                                    onChange={(e) => handleAcaoChange(index, 'valor_prazo', e)}
                                                    disabled={acao.tipo_prazo !== 'dias'}
                                                    min="1"
                                                />
                                                <label htmlFor={`dias-${index}`}>dias</label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="return-status-group">
                                        <p>E quando a tarefa filha for finalizada...</p>
                                        <div className="form-group">
                                            <label>Se "Aprovado", mover tarefa original para:</label>
                                            <select value={acao.status_retorno_sucesso_id} onChange={(e) => handleAcaoChange(index, 'status_retorno_sucesso_id', e)} disabled={!setorOrigemId}>
                                                <option value="">-- Não mover --</option>
                                                {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Se "Negado", mover tarefa original para:</label>
                                            <select value={acao.status_retorno_falha_id} onChange={(e) => handleAcaoChange(index, 'status_retorno_falha_id', e)} disabled={!setorOrigemId}>
                                                <option value="">-- Não mover --</option>
                                                {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addAcao} className="btn-add-action">+ Adicionar outra ação</button>
                        </div>
                        
                        <div className="form-footer">
                           <button type="submit" className="btn btn-primary">Criar Regra de Automação</button>
                        </div>
                    </form>
                </div>

                <div className="list-column">
                    <h2>Regras Atuais</h2>
                    {regras.length === 0 ? (
                        <p className="empty-state">Nenhuma regra de automação criada ainda.</p>
                    ) : (
                        <div className="rules-list-container">
                            {regras.map(regra => (
                                <div key={regra.id} className="rule-card">
                                    <div className="rule-card-content">
                                        <h4>{regra.nome_regra}</h4>
                                        <div className="rule-flow">
                                            <div className="flow-item">
                                                <span>QUANDO em</span>
                                                <div className="tag">{regra.setor_origem_nome}</div>
                                            </div>
                                            <div className="flow-arrow">→</div>
                                            <div className="flow-item">
                                                <span>For para</span>
                                                <div className="tag">{regra.status_gatilho_nome}</div>
                                            </div>
                                            <div className="flow-arrow">⇩</div>
                                            <div className="flow-item">
                                                <span>ENTÃO</span>
                                                {regra.acoes.map(acao => (
                                                   <div className="tag" key={acao.id}>Criar em <strong>{acao.setor_destino_nome}</strong></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(regra.id)} className="btn-icon btn-delete-rule" title="Deletar Regra">
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AutomationPage;

/*
// Arquivo: AutomationPage.jsx

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import './AutomationPage.css';

// Ícone simples de lixeira para um visual mais limpo
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
    </svg>
);

function AutomationPage() {
    // Estados
    const [regras, setRegras] = useState([]);
    const [setores, setSetores] = useState([]);
    const [statuses, setStatuses] = useState({});
    
    const [nomeRegra, setNomeRegra] = useState('');
    const [setorOrigemId, setSetorOrigemId] = useState('');
    const [statusGatilhoId, setStatusGatilhoId] = useState('');
    
    // ===== ESTADO DAS AÇÕES ATUALIZADO =====
    const [acoes, setAcoes] = useState([
        { 
            setor_destino_id: '', 
            template_descricao: 'Gerado a partir de: {descricao_original}', 
            status_retorno_sucesso_id: '', 
            status_retorno_falha_id: '',
            tipo_prazo: 'nenhum',
            valor_prazo: 5
        }
    ]);

    // Funções de busca e manipulação de dados
    const fetchAllData = async () => { try { const [regrasRes, setoresRes] = await Promise.all([ api.get('/regras_automacao'), api.get('/setores') ]); setRegras(regrasRes.data); setSetores(setoresRes.data); const allSectors = setoresRes.data; const statusesPromises = allSectors.map(s => api.get(`/setores/${s.id}/status`)); const statusesResults = await Promise.all(statusesPromises); const statusesMap = {}; statusesResults.forEach((result, index) => { const sectorId = allSectors[index].id; statusesMap[sectorId] = result.data; }); setStatuses(statusesMap); } catch (error) { toast.error("Falha ao carregar dados de automação."); } };
    useEffect(() => { fetchAllData(); }, []);

    const handleAcaoChange = (index, field, value) => { const novasAcoes = [...acoes]; novasAcoes[index][field] = value; setAcoes(novasAcoes); };
    
    // ===== FUNÇÃO DE ADICIONAR AÇÃO ATUALIZADA =====
    const addAcao = () => { 
        setAcoes([...acoes, { 
            setor_destino_id: '', 
            template_descricao: 'Gerado a partir de: {descricao_original}', 
            status_retorno_sucesso_id: '', 
            status_retorno_falha_id: '',
            tipo_prazo: 'nenhum',
            valor_prazo: 5 
        }]); 
    };
    
    const removeAcao = (index) => { const novasAcoes = acoes.filter((_, i) => i !== index); setAcoes(novasAcoes); };

    // ===== FUNÇÃO DE SUBMIT ATUALIZADA (PARA LIMPAR O FORMULÁRIO) =====
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        try { 
            await api.post('/regras_automacao', { 
                nome_regra: nomeRegra, 
                setor_origem_id: setorOrigemId, 
                status_gatilho_id: statusGatilhoId, 
                acoes: acoes 
            }); 
            toast.success("Regra de automação criada com sucesso!"); 
            fetchAllData(); 
            // Limpa o formulário completamente
            setNomeRegra(''); 
            setSetorOrigemId(''); 
            setStatusGatilhoId(''); 
            setAcoes([
                { 
                    setor_destino_id: '', 
                    template_descricao: 'Gerado a partir de: {descricao_original}', 
                    status_retorno_sucesso_id: '', 
                    status_retorno_falha_id: '',
                    tipo_prazo: 'nenhum',
                    valor_prazo: 5
                }
            ]); 
        } catch (error) { 
            toast.error(error.response?.data?.error || "Falha ao criar regra."); 
        } 
    };
    
    const handleDelete = async (regraId) => { if (window.confirm("Tem certeza?")) { try { await api.delete(`/regras_automacao/${regraId}`); toast.success("Regra deletada!"); setRegras(regras.filter(r => r.id !== regraId)); } catch (error) { toast.error(error.response?.data?.error || "Falha ao deletar regra."); } } };
    
    const statusGatilhoOptions = statuses[setorOrigemId] || [];

    return (
        <div className="automation-page">
            <header className="page-header">
                <h1>Gerenciamento de Automações</h1>
                <Link to="/app" className="btn btn-secondary">Voltar ao Dashboard</Link>
            </header>
            
            <div className="automation-layout">
                <div className="form-column">
                    <form onSubmit={handleSubmit} className="automation-form-card">
                        <h2>Criar Nova Regra</h2>
                        <div className="form-step">
                            <h3><span>1</span> Dê um nome para a regra</h3>
                            <input type="text" value={nomeRegra} onChange={e => setNomeRegra(e.target.value)} placeholder="Ex: Enviar contrato para o Jurídico" required />
                        </div>
                        <div className="form-step">
                            <h3><span>2</span> Defina o gatilho (QUANDO...)</h3>
                            <div className="form-group">
                                <label>Uma tarefa no setor:</label>
                                <select value={setorOrigemId} onChange={e => { setSetorOrigemId(e.target.value); setStatusGatilhoId(''); }} required>
                                    <option value="" disabled>Selecione um setor...</option>
                                    {setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>For movida para a coluna:</label>
                                <select value={statusGatilhoId} onChange={e => setStatusGatilhoId(e.target.value)} required disabled={!setorOrigemId}>
                                    <option value="" disabled>Selecione uma coluna...</option>
                                    {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                </select>
                            </div>
                        </div>
                        <div className="form-step">
                            <h3><span>3</span> Configure as ações (ENTÃO...)</h3>
                            {acoes.map((acao, index) => (
                                <div key={index} className="action-card">
                                    <div className="action-header">
                                        <h4>Ação {index + 1}</h4>
                                        {acoes.length > 1 && (
                                            <button type="button" onClick={() => removeAcao(index)} className="btn-icon" title="Remover Ação">×</button>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Criar uma nova tarefa no setor:</label>
                                        <select value={acao.setor_destino_id} onChange={(e) => handleAcaoChange(index, 'setor_destino_id', e.target.value)} required>
                                            <option value="" disabled>Selecione o destino...</option>
                                            {setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Com a descrição (use {`{variáveis}`}):</label>
                                        <textarea value={acao.template_descricao} onChange={(e) => handleAcaoChange(index, 'template_descricao', e.target.value)} rows="3" />
                                    </div>
                                    
                                    
                                    <div className="deadline-group">
                                        <label className="group-label">Data de Conclusão da Nova Tarefa:</label>
                                        <div className="radio-group">
                                            <div className="radio-option">
                                                <input type="radio" id={`nenhum-${index}`} name={`prazo-${index}`} value="nenhum" checked={acao.tipo_prazo === 'nenhum'} onChange={(e) => handleAcaoChange(index, 'tipo_prazo', e.target.value)} />
                                                <label htmlFor={`nenhum-${index}`}>Não definir data</label>
                                            </div>
                                            <div className="radio-option">
                                                <input type="radio" id={`copiar-${index}`} name={`prazo-${index}`} value="copiar" checked={acao.tipo_prazo === 'copiar'} onChange={(e) => handleAcaoChange(index, 'tipo_prazo', e.target.value)} />
                                                <label htmlFor={`copiar-${index}`}>Usar a mesma data da tarefa original</label>
                                            </div>
                                            <div className="radio-option">
                                                <input type="radio" id={`dias-${index}`} name={`prazo-${index}`} value="dias" checked={acao.tipo_prazo === 'dias'} onChange={(e) => handleAcaoChange(index, 'tipo_prazo', e.target.value)} />
                                                <label htmlFor={`dias-${index}`}>Definir prazo de</label>
                                                <input 
                                                    type="number" 
                                                    className="days-input" 
                                                    value={acao.valor_prazo} 
                                                    onChange={(e) => handleAcaoChange(index, 'valor_prazo', e.target.value)}
                                                    disabled={acao.tipo_prazo !== 'dias'}
                                                    min="1"
                                                />
                                                <label htmlFor={`dias-${index}`}>dias</label>
                                            </div>
                                        </div>
                                    </div>
                                   

                                    <div className="return-status-group">
                                        <p>E quando a tarefa filha for finalizada...</p>
                                        <div className="form-group">
                                            <label>Se "Aprovado", mover tarefa original para:</label>
                                            <select value={acao.status_retorno_sucesso_id} onChange={(e) => handleAcaoChange(index, 'status_retorno_sucesso_id', e.target.value)} disabled={!setorOrigemId}>
                                                <option value="">-- Não mover --</option>
                                                {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Se "Negado", mover tarefa original para:</label>
                                            <select value={acao.status_retorno_falha_id} onChange={(e) => handleAcaoChange(index, 'status_retorno_falha_id', e.target.value)} disabled={!setorOrigemId}>
                                                <option value="">-- Não mover --</option>
                                                {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addAcao} className="btn-add-action">+ Adicionar outra ação</button>
                        </div>
                        <div className="form-footer">
                           <button type="submit" className="btn btn-primary">Criar Regra de Automação</button>
                        </div>
                    </form>
                </div>
                <div className="list-column">
                    <h2>Regras Atuais</h2>
                    {regras.length === 0 ? (
                        <p className="empty-state">Nenhuma regra de automação criada ainda.</p>
                    ) : (
                        <div className="rules-list-container">
                            {regras.map(regra => (
                                <div key={regra.id} className="rule-card">
                                    <div className="rule-card-content">
                                        <h4>{regra.nome_regra}</h4>
                                        <div className="rule-flow">
                                            <div className="flow-item">
                                                <span>QUANDO em</span>
                                                <div className="tag">{regra.setor_origem_nome}</div>
                                            </div>
                                            <div className="flow-arrow">→</div>
                                            <div className="flow-item">
                                                <span>For para</span>
                                                <div className="tag">{regra.status_gatilho_nome}</div>
                                            </div>
                                            <div className="flow-arrow">⇩</div>
                                            <div className="flow-item">
                                                <span>ENTÃO</span>
                                                {regra.acoes.map(acao => (
                                                   <div className="tag" key={acao.id}>Criar em <strong>{acao.setor_destino_nome}</strong></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(regra.id)} className="btn-icon btn-delete-rule" title="Deletar Regra">
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
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
import './AutomationPage.css'; // Usaremos o novo CSS

// Ícone simples de lixeira para um visual mais limpo
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
    </svg>
);

function AutomationPage() {
    // Seus hooks de estado (useState, useEffect) continuam exatamente os mesmos.
    const [regras, setRegras] = useState([]);
    const [setores, setSetores] = useState([]);
    const [statuses, setStatuses] = useState({});
    
    const [nomeRegra, setNomeRegra] = useState('');
    const [setorOrigemId, setSetorOrigemId] = useState('');
    const [statusGatilhoId, setStatusGatilhoId] = useState('');
    const [acoes, setAcoes] = useState([ { setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}', status_retorno_sucesso_id: '', status_retorno_falha_id: '' } ]);

    // Suas funções de lógica (fetchAllData, handleSubmit, etc.) também continuam as mesmas.
    const fetchAllData = async () => { try { const [regrasRes, setoresRes] = await Promise.all([ api.get('/regras_automacao'), api.get('/setores') ]); setRegras(regrasRes.data); setSetores(setoresRes.data); const allSectors = setoresRes.data; const statusesPromises = allSectors.map(s => api.get(`/setores/${s.id}/status`)); const statusesResults = await Promise.all(statusesPromises); const statusesMap = {}; statusesResults.forEach((result, index) => { const sectorId = allSectors[index].id; statusesMap[sectorId] = result.data; }); setStatuses(statusesMap); } catch (error) { toast.error("Falha ao carregar dados de automação."); } };
    useEffect(() => { fetchAllData(); }, []);

    const handleAcaoChange = (index, field, value) => { const novasAcoes = [...acoes]; novasAcoes[index][field] = value; setAcoes(novasAcoes); };
    const addAcao = () => { setAcoes([...acoes, { setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}', status_retorno_sucesso_id: '', status_retorno_falha_id: '' }]); };
    const removeAcao = (index) => { const novasAcoes = acoes.filter((_, i) => i !== index); setAcoes(novasAcoes); };

    const handleSubmit = async (e) => { e.preventDefault(); try { await api.post('/regras_automacao', { nome_regra: nomeRegra, setor_origem_id: setorOrigemId, status_gatilho_id: statusGatilhoId, acoes: acoes }); toast.success("Regra de automação criada com sucesso!"); fetchAllData(); setNomeRegra(''); setSetorOrigemId(''); setStatusGatilhoId(''); setAcoes([{ setor_destino_id: '', template_descricao: 'Gerado a partir de: {descricao_original}', status_retorno_sucesso_id: '', status_retorno_falha_id: '' }]); } catch (error) { toast.error(error.response?.data?.error || "Falha ao criar regra."); } };
    const handleDelete = async (regraId) => { if (window.confirm("Tem certeza?")) { try { await api.delete(`/regras_automacao/${regraId}`); toast.success("Regra deletada!"); setRegras(regras.filter(r => r.id !== regraId)); } catch (error) { toast.error(error.response?.data?.error || "Falha ao deletar regra."); } } };
    
    const statusGatilhoOptions = statuses[setorOrigemId] || [];

    return (
        <div className="automation-page">
            <header className="page-header">
                <h1>Gerenciamento de Automações</h1>
                <Link to="/app" className="btn btn-secondary">Voltar ao Dashboard</Link>
            </header>
            
           
            <div className="automation-layout">

               
                <div className="form-column">
                    <form onSubmit={handleSubmit} className="automation-form-card">
                        <h2>Criar Nova Regra</h2>

                        <div className="form-step">
                            <h3><span>1</span> Dê um nome para a regra</h3>
                            <input type="text" value={nomeRegra} onChange={e => setNomeRegra(e.target.value)} placeholder="Ex: Enviar contrato para o Jurídico" required />
                        </div>

                        <div className="form-step">
                            <h3><span>2</span> Defina o gatilho (QUANDO...)</h3>
                            <div className="form-group">
                                <label>Uma tarefa no setor:</label>
                                <select value={setorOrigemId} onChange={e => { setSetorOrigemId(e.target.value); setStatusGatilhoId(''); }} required>
                                    <option value="" disabled>Selecione um setor...</option>
                                    {setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>For movida para a coluna:</label>
                                <select value={statusGatilhoId} onChange={e => setStatusGatilhoId(e.target.value)} required disabled={!setorOrigemId}>
                                    <option value="" disabled>Selecione uma coluna...</option>
                                    {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                </select>
                            </div>
                        </div>

                        <div className="form-step">
                            <h3><span>3</span> Configure as ações (ENTÃO...)</h3>
                            {acoes.map((acao, index) => (
                                <div key={index} className="action-card">
                                    <div className="action-header">
                                        <h4>Ação {index + 1}</h4>
                                        {acoes.length > 1 && (
                                            <button type="button" onClick={() => removeAcao(index)} className="btn-icon" title="Remover Ação">×</button>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label>Criar uma nova tarefa no setor:</label>
                                        <select value={acao.setor_destino_id} onChange={(e) => handleAcaoChange(index, 'setor_destino_id', e.target.value)} required>
                                            <option value="" disabled>Selecione o destino...</option>
                                            {setores.map(s => (<option key={s.id} value={s.id}>{s.nome}</option>))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Com a descrição (use {`{variáveis}`}):</label>
                                        <textarea value={acao.template_descricao} onChange={(e) => handleAcaoChange(index, 'template_descricao', e.target.value)} rows="3" />
                                    </div>
                                    <div className="return-status-group">
                                        <p>E quando a tarefa filha for finalizada...</p>
                                        <div className="form-group">
                                            <label>Se "Aprovado", mover tarefa original para:</label>
                                            <select value={acao.status_retorno_sucesso_id} onChange={(e) => handleAcaoChange(index, 'status_retorno_sucesso_id', e.target.value)} disabled={!setorOrigemId}>
                                                <option value="">-- Não mover --</option>
                                                {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Se "Negado", mover tarefa original para:</label>
                                            <select value={acao.status_retorno_falha_id} onChange={(e) => handleAcaoChange(index, 'status_retorno_falha_id', e.target.value)} disabled={!setorOrigemId}>
                                                <option value="">-- Não mover --</option>
                                                {statusGatilhoOptions.map(st => (<option key={st.id} value={st.id}>{st.nome}</option>))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addAcao} className="btn-add-action">+ Adicionar outra ação</button>
                        </div>
                        
                        <div className="form-footer">
                           <button type="submit" className="btn btn-primary">Criar Regra de Automação</button>
                        </div>
                    </form>
                </div>

                
                <div className="list-column">
                    <h2>Regras Atuais</h2>
                    {regras.length === 0 ? (
                        <p className="empty-state">Nenhuma regra de automação criada ainda.</p>
                    ) : (
                        <div className="rules-list-container">
                            {regras.map(regra => (
                                <div key={regra.id} className="rule-card">
                                    <div className="rule-card-content">
                                        <h4>{regra.nome_regra}</h4>
                                        <div className="rule-flow">
                                            <div className="flow-item">
                                                <span>QUANDO em</span>
                                                <div className="tag">{regra.setor_origem_nome}</div>
                                            </div>
                                            <div className="flow-arrow">→</div>
                                            <div className="flow-item">
                                                <span>For para</span>
                                                <div className="tag">{regra.status_gatilho_nome}</div>
                                            </div>
                                            <div className="flow-arrow">⇩</div>
                                            <div className="flow-item">
                                                <span>ENTÃO</span>
                                                {regra.acoes.map(acao => (
                                                   <div className="tag" key={acao.id}>Criar em <strong>{acao.setor_destino_nome}</strong></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDelete(regra.id)} className="btn-icon btn-delete-rule" title="Deletar Regra">
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AutomationPage;*/


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
                        <button type="button" onClick={addAcao} className="btn btn-primary">+ Adicionar outra ação</button>
                    </div>
                    <button type="submit" className="auth-button">Criar Regra</button>
                </form>
            </div>
            <div className="automation-list-container card"><h2>Regras Atuais</h2><ul className="rules-list">{regras.map(regra => (<li key={regra.id}><div className="rule-details"><strong>{regra.nome_regra}</strong><p className="rule-trigger">Quando: <span>{regra.setor_origem_nome}</span> → <span>{regra.status_gatilho_nome}</span></p><div className="rule-actions"><p>Então:</p><ul>{regra.acoes.map(acao => (<li key={acao.id}>Criar tarefa em <span>{acao.setor_destino_nome}</span></li>))}</ul></div></div><button onClick={() => handleDelete(regra.id)} className="delete-rule-btn">🗑️</button></li>))}</ul></div>
        </div>
    );
}

export default AutomationPage;
*/
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