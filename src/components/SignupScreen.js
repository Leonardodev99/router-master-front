import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; // usa axios com baseURL
import "../styles/SignupScreen.css";

function SignupScreen() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);

  const validate = () => {
    const newErrors = [];

    if (username.length < 5 || username.length > 255) {
      newErrors.push("O nome de usuário deve ter entre 5 e 255 caracteres.");
    }
    if (/^\d{2}/.test(username)) {
      newErrors.push("O nome de usuário não pode começar com dois números.");
    }
    if (!/^\d{3} \d{3} \d{3}$/.test(phone)) {
      newErrors.push("O telefone deve estar no formato xxx xxx xxx.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.push("O e-mail inserido não é válido.");
    }
    if (password.length < 6 || password.length > 15) {
      newErrors.push("A senha deve ter entre 6 e 15 caracteres.");
    }
    if (password !== confirmPassword) {
      newErrors.push("As senhas não coincidem.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await api.post("/users", {
        username,
        phone,
        email,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        navigate("/home");
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors(["Erro inesperado. Tente novamente."]);
      }
    }
  };

  return (
    <div className="signup-screen">
      <form onSubmit={handleSignup}>
        <h2>Criar Conta</h2>
        {errors.length > 0 && (
          <ul className="error-messages">
            {errors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        )}

        <input
          type="text"
          placeholder="Nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Telefone (ex: 930 123 456)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="E-mail"
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
