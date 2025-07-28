// Arquivo: gerenciador-tarefas-web/src/services/api.js

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // Aumenta o timeout para 30 segundos (30000 ms)
});

console.log(`Instância da API criada para a URL: ${api.defaults.baseURL}`);

export default api;