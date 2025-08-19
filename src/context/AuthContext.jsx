// Arquivo: gerenciador-tarefas-web/src/context/AuthContext.jsx - VERSÃO CORRIGIDA

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Inicializa o estado lendo tanto o token quanto as informações do usuário do localStorage
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const savedUserInfo = localStorage.getItem('userInfo');
      return savedUserInfo ? JSON.parse(savedUserInfo) : null;
    } catch (error) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Esta lógica agora apenas garante que o token seja válido e o header da API seja setado.
    // A informação do usuário já foi carregada do localStorage.
    try {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        // Opcional: Verificar se o token expirou e limpar se necessário
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout(); // Se o token expirou, força o logout
        }
      } else {
        delete api.defaults.headers.common['Authorization'];
        // Se não há token, garante que não há info de usuário
        if (userInfo) {
            setUserInfo(null);
            localStorage.removeItem('userInfo');
        }
      }
    } catch (error) {
      console.error("Token inválido encontrado, limpando sessão:", error);
      logout();
    }
  }, [token]);

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      
      // ===== MUDANÇA PRINCIPAL AQUI =====
      // Agora capturamos tanto o token quanto o userInfo da resposta da API
      const { token: newToken, userInfo: newUserInfo } = response.data;
      
      // Salvamos AMBOS no localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
      
      // E atualizamos AMBOS no estado do React
      setToken(newToken);
      setUserInfo(newUserInfo);
      
      toast.success('Login bem-sucedido!');
    } catch (error) {
      console.error('Erro de login:', error);
      if (error.response?.data?.needsVerification) {
        toast.warn('Sua conta não foi verificada. Por favor, verifique seu e-mail.');
        throw { ...error, needsVerification: true }; 
      }
      toast.error(error.response?.data?.error || 'Falha no login. Verifique suas credenciais.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, senha) => {
    setLoading(true);
    try {
      // A rota de registro público não existe mais, mas mantemos a função caso seja usada em outro lugar
      await api.post('/auth/register', { email, senha });
      toast.success('Registro realizado com sucesso! Verifique seu e-mail para o código de ativação.');
    } catch (error) {
      console.error('Erro de registro:', error);
      toast.error(error.response?.data?.error || 'Falha no registro.');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    // Ao fazer logout, limpa AMBOS do localStorage e do estado
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setToken(null);
    setUserInfo(null);
    toast.info('Você saiu da sua conta.');
  };

  const value = {
    token,
    userInfo,
    isLoggedIn: !!token && !!userInfo, // A sessão é válida se ambos existirem
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};


/*
// Arquivo: gerenciador-tarefas-web/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const decoded = jwtDecode(token);
        setUserInfo(decoded);
      } else {
        delete api.defaults.headers.common['Authorization'];
        setUserInfo(null);
      }
    } catch (error) {
      console.error("Token inválido encontrado:", error);
      localStorage.removeItem('token');
      setToken(null);
      setUserInfo(null);
    }
  }, [token]);

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      toast.success('Login bem-sucedido!');
    } catch (error) {
      console.error('Erro de login:', error);
      if (error.response?.data?.needsVerification) {
        toast.warn('Sua conta não foi verificada. Por favor, verifique seu e-mail.');
        throw { ...error, needsVerification: true }; 
      }
      toast.error(error.response?.data?.error || 'Falha no login. Verifique suas credenciais.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, senha) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { email, senha });
      toast.success('Registro realizado com sucesso! Verifique seu e-mail para o código de ativação.');
    } catch (error) {
      console.error('Erro de registro:', error);
      toast.error(error.response?.data?.error || 'Falha no registro.');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.info('Você saiu da sua conta.');
  };

  const value = {
    token,
    userInfo,
    isLoggedIn: !!token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
*/

/*import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api'; // Importa a instância configurada
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, senha });
      const { token: newToken } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      toast.success('Login bem-sucedido!');
    } catch (error) {
      console.error('Erro de login:', error);
      if (error.response?.data?.needsVerification) {
        toast.warn('Sua conta não foi verificada. Por favor, verifique seu e-mail.');
        throw { ...error, needsVerification: true };
      }
      toast.error(error.response?.data?.error || 'Falha no login. Verifique suas credenciais.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, senha) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { email, senha });
      toast.success('Registro realizado com sucesso! Verifique seu e-mail para o código de ativação.');
    } catch (error) {
      console.error('Erro de registro:', error);
      toast.error(error.response?.data?.error || 'Falha no registro.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    toast.info('Você saiu da sua conta.');
  };

  const value = {
    token,
    isLoggedIn: !!token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};*/