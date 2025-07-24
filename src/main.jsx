import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// Define a URL base para todas as requisições do axios
// Ele vai ler a VITE_API_BASE_URL do arquivo .env
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);