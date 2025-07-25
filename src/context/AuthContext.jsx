import React, { createContext, useState, useEffect, useContext } from 'react';
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
};