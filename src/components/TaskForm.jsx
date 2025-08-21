// Arquivo: gerenciador-tarefas-web/src/components/TaskForm.jsx

import React, { useState } from 'react';

// Recebe a lista de 'members' via props
function TaskForm({ onSubmit, members = [] }) {
  const [descricao, setDescricao] = useState('');
  const [responsavelId, setResponsavelId] = useState(''); // Agora guarda o ID
  const [dataPrevista, setDataPrevista] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!descricao || !dataPrevista) {
      alert("Por favor, preencha a descrição e a data.");
      return;
    }
    onSubmit({
      descricao,
      responsavel_id: responsavelId || null, // Envia o ID ou null se "Ninguém" for selecionado
      data_prevista_conclusao: dataPrevista,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div>
        <label htmlFor="descricao">Descrição:</label>
        <input type="text" id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
      </div>
      
      {/* MUDANÇA PRINCIPAL: Input de texto vira um select */}
      <div>
        <label htmlFor="responsavel_id">Responsável:</label>
        <select
          id="responsavel_id"
          value={responsavelId}
          onChange={(e) => setResponsavelId(e.target.value)}
        >
          <option value="">-- Ninguém --</option>
          {members.map(member => (
            <option key={member.id} value={member.id}>
				{member.nome || member.email}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="dataPrevista">Data Prevista de Conclusão:</label>
        <input type="date" id="dataPrevista" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} required />
      </div>
      
	  <button type="submit" className="btn btn-success">Adicionar Tarefa</button>
    </form>
  );
}

export default TaskForm;