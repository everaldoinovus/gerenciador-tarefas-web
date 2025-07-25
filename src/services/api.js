import axios from 'axios';

// Cria uma instância do Axios com a configuração base.
// Esta é a maneira mais robusta de configurar o Axios para um projeto.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Para depuração, podemos logar a URL que a instância está usando
console.log(`Instância da API criada para a URL: ${api.defaults.baseURL}`);

export default api;