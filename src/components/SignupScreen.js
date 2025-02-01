import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SignupScreen.css";

function SignupScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      navigate("/home");
    } else {
      alert("As senhas não coincidem!");
    }
  };

  return (
    <div className="signup-screen">
      <form onSubmit={handleSignup}>
        <h2>Criar Conta</h2>
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
        <input
          type="password"
          placeholder="Confirme a Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}

export default SignupScreen;
