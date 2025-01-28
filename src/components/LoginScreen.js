import React, { useState } from "react";
import "../styles/LoginScreen.css";

function LoginScreen({ onLogin, onNavigateToSignup, onNavigateToRecover }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="login-screen">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
        <div className="additional-options">
          <a 
          href="#" 
          className="forgot-password" 
          onClick={(e) => {
            e.preventDefault();
            onNavigateToRecover();
          }}
          >
            Esqueceu a senha?
          </a>

          <a 
          href="#" 
          className="create-account" 
          onClick={(e) => {
            e.preventDefault();
            onNavigateToSignup();
          }}>Criar conta</a>
        </div>
      </form>
    </div>
  );
}

export default LoginScreen;
