import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RecoverAccountScreen.css";

function RecoverAccountScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1); // Controla o fluxo

  // Enviar código de recuperação
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Por favor, insira seu e-mail!");
      return;
    }

    setTimeout(() => {
      setMessage("Verifique seu e-mail e insira o código de recuperação.");
      setStep(2);
    }, 1500);
  };

  // Verificar código
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!code) {
      setError("Por favor, insira o código de recuperação!");
      return;
    }

    setTimeout(() => {
      setMessage("Código verificado com sucesso! Agora redefina sua senha.");
      setStep(3);
    }, 1500);
  };

  // Redefinir senha
  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword) {
      setError("Por favor, insira uma nova senha!");
      return;
    }

    setTimeout(() => {
      setMessage("Senha redefinida com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    }, 1500);
  };

  return (
    <div className="recover-account-screen">
      <div className="recover-card">
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <h2>Recuperar Conta</h2>
            <p>Insira seu e-mail para receber um código de recuperação.</p>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Enviar Código</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit}>
            <h2>Verificar Código</h2>
            <p>Insira o código de recuperação enviado ao seu e-mail.</p>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <input
              type="text"
              placeholder="Código de recuperação"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Confirmar Código</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <h2>Redefinir Senha</h2>
            <p>Crie uma nova senha para sua conta.</p>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            <input
              type="password"
              placeholder="Nova Senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit">Redefinir Senha</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default RecoverAccountScreen;
