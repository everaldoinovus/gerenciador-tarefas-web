import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipLoader } from 'react-spinners';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, senha);
      navigate('/app');
    } catch (error) {
      // Se o erro especial que criamos for capturado, redirecionamos
      if (error.needsVerification) {
        navigate('/verify-email', { state: { email: email } });
      }
      // Outros erros já são tratados pelo toast no AuthContext
      console.error("Falha no login (componente).");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h2>Entrar</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={loading} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <ClipLoader color={"#ffffff"} size={20} /> : 'Login'}
          </button>
        </form>
        <p className="auth-switch-link">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;