import React, { useState } from "react";
import "../styles/LoginScreen.css";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

function LoginScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3005/tokens", {
        email,
        password,
      });

      const token = response.data.token;
      if (token) {
        localStorage.setItem("token", token);
        console.log("Token salvo no localStorage:", token);
        navigate("/home");
      } else {
        console.error("Token não recebido do servidor.");
        setError("Erro interno. Tente novamente.");
    }
   } catch (error) {
      console.error("Erro no login:", error);
      setError("E-mail ou senha inválidos.");
    }
  };

  return (
    <div className="login-screen">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

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
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/recover"); }}>Esqueceu a senha?</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate("/signup"); }}>Criar conta</a>
        </div>
      </form>
    </div>
  );
}

export default LoginScreen;

