import React, { useState } from "react";
import "../styles/LoginScreen.css";
import { useNavigate } from "react-router-dom";

function LoginScreen() {
  const navigate = useNavigate(); // Usando React Router para navegação
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email && !password) {
      setError('Preencha todos os campos!')
      return;
    }

    if(email === 'tiago@gmail.com' && password === "1234") {
      navigate("/home");
    } else {
      setError("E-mail ou password incorretos!");
    }
  };

  return (
    <div className="login-screen">
      <form onSubmit={handleLogin}>
        <h2>Login</h2>
        {error && <p className="error-message">{error}</p>}

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
          <a href="#" className="forgot-password" onClick={(e) => {
            e.preventDefault();
            navigate("/recover")
          }}>
            Esqueceu a senha?
          </a>

          <a href="#" className="create-account" onClick={(e) => {
            e.preventDefault();
            navigate("/signup")
          }}>Criar conta
          </a>
        </div>
      </form>
    </div>
  );
}

export default LoginScreen;
