import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

function VerifyEmailPage() {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Pegamos o email que foi passado pela página de registro
  const email = location.state?.email;

  // Se o usuário chegar a esta página sem um email, redireciona para o registro
  if (!email) {
    navigate('/register');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3333/auth/verify', { email, codigo });
      toast.success('Conta verificada com sucesso! Você já pode fazer o login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Falha ao verificar o código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h2>Verifique seu E-mail</h2>
        <p>Enviamos um código de 6 dígitos para <strong>{email}</strong>. Por favor, insira-o abaixo.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="codigo">Código de Verificação</label>
            <input
              type="text"
              id="codigo"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              maxLength={6}
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? <ClipLoader color={"#ffffff"} size={20} /> : 'Verificar e Ativar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmailPage;