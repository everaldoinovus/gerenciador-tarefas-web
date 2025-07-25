import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// Vamos ser explícitos sobre a URL de fallback
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';
axios.defaults.baseURL = apiUrl;

// Para depuração, vamos logar a URL que está sendo usada
console.log(`A API está configurada para: ${apiUrl}`);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);