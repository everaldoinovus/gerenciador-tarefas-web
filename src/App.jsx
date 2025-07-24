import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VerifyEmailPage from './pages/VerifyEmailPage'; // Importa a nova página

// Componente para lidar com a rota de login/registro
function AuthRoutes() {
  const { isLoggedIn } = useAuth();
  // Se o usuário já estiver logado, redireciona para o app em vez de mostrar o login
  return isLoggedIn ? <Navigate to="/app" /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthRoutes />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* NOVA ROTA */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/app" />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light"/>
    </AuthProvider>
  );
}

export default App;