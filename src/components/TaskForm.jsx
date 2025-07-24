import { useState } from 'react';

// O formulário agora é simples. Ele apenas recebe uma função 'onSubmit'.
function TaskForm({ onSubmit }) {
  const [descricao, setDescricao] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!descricao || !responsavel || !dataPrevista) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Chama a função que recebeu via props, passando os dados do formulário.
    onSubmit({
      descricao,
      responsavel,
      data_prevista_conclusao: dataPrevista,
    });
  };

  return (
    // Removemos o título, pois ele ficará no modal.
    <form onSubmit={handleSubmit} className="task-form">
      <div>
        <label htmlFor="descricao">Descrição:</label>
        <input type="text" id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
      </div>
      
      <div>
        <label htmlFor="responsavel">Responsável:</label>
        <input type="text" id="responsavel" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} required />
      </div>
      
      <div>
        <label htmlFor="dataPrevista">Data Prevista de Conclusão:</label>
        <input type="date" id="dataPrevista" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} required />
      </div>
      
      <button type="submit">Adicionar Tarefa</button>
    </form>
  );
}

export default TaskForm;