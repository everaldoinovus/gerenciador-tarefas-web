// Arquivo: gerenciador-tarefas-web/src/App.jsx - VERSÃO ATUALIZADA

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/LoginPage';
// A RegisterPage não é mais necessária para uma rota pública
// import RegisterPage from './pages/RegisterPage'; 
import DashboardPage from './pages/DashboardPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AutomationPage from './pages/AutomationPage';

// ===== NOVA PÁGINA DE GERENCIAMENTO DE USUÁRIOS IMPORTADA =====
import UserManagementPage from './pages/UserManagementPage';

// ===== ROTA PROTEGIDA ATUALIZADA PARA VERIFICAR O PAPEL DE 'admin' =====
function AdminRoute({ children }) {
  const { userInfo } = useAuth();

  // userInfo pode ser null no carregamento inicial, então esperamos
  if (!userInfo) {
    return null; // ou um spinner de carregamento
  }

  // A verificação agora é baseada no novo campo 'role'
  if (userInfo.role !== 'admin') {
    return <Navigate to="/app" />;
  }
  
  return children;
}

// Rota para usuários que tentam acessar login quando já estão logados
function AuthRoutes() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/app" /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthRoutes />} />
          {/* A ROTA DE REGISTRO PÚBLICO FOI REMOVIDA */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/automations" 
            element={
              <ProtectedRoute>
                {/* A ROTA AGORA USA O NOVO AdminRoute */}
                <AdminRoute>
                  <AutomationPage />
                </AdminRoute>
              </ProtectedRoute>
            } 
          />

          {/* ===== NOVA ROTA PARA A PÁGINA DE GERENCIAMENTO DE USUÁRIOS ===== */}
          <Route 
            path="/users"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <UserManagementPage />
                </AdminRoute>
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


/*
// Arquivo: gerenciador-tarefas-web/src/App.jsx

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
import VerifyEmailPage from './pages/VerifyEmailPage';
import AutomationPage from './pages/AutomationPage';

// Rota protegida que verifica se o usuário é 'master'
function MasterRoute({ children }) {
  const { userInfo } = useAuth();

  // userInfo pode ser null no carregamento inicial, então esperamos
  if (!userInfo) {
    return null; // ou um spinner de carregamento
  }

  if (userInfo.funcaoGlobal !== 'master') {
    return <Navigate to="/app" />;
  }
  
  return children;
}

// Rota para usuários que tentam acessar login/registro quando já estão logados
function AuthRoutes() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/app" /> : <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthRoutes />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/automations" 
            element={
              <ProtectedRoute>
                <MasterRoute>
                  <AutomationPage />
                </MasterRoute>
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

export default App;*/


/*import React from 'react';
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

export default App;*/