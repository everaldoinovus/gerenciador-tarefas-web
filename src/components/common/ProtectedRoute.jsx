import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    // Se não estiver logado, redireciona para a página de login
    return <Navigate to="/login" />;
  }

  // Se estiver logado, renderiza o componente filho (a nossa página do dashboard)
  return children;
}

export default ProtectedRoute;