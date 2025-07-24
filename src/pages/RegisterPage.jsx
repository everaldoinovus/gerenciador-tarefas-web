import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ClipLoader } from 'react-spinners';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, senha);
      // Após o sucesso do registro, redireciona para a página de verificação,
      // passando o email no estado da navegação.
      navigate('/verify-email', { state: { email: email } });
    } catch (error) {
      console.error("Falha no registro (componente).");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h2>Criar Conta</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} required disabled={loading} />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <ClipLoader color={"#ffffff"} size={20} /> : 'Registrar'}
          </button>
        </form>
        <p className="auth-switch-link">
          Já tem uma conta? <Link to="/login">Faça o login</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;