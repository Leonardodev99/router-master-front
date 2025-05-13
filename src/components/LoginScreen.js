import React, { useState } from "react";
import "../styles/LoginScreen.css";
import { useNavigate } from "react-router-dom";
import axios from 'axios';


function LoginScreen() {
  const navigate = useNavigate(); // Usando React Router para navegação
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const apiUrl = 'http://localhost:3005';

  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {

      const response = await axios.post(`${apiUrl}/tokens`, {
        email,
        password,
      });

      if(response.status === 200) {
        const token = response.data.token;

        localStorage.setItem('token', token);
        console.log("Token enviado na requisição:", token);

        setMessage('Login sucessfull!');
        navigate("/home");
      } else {
        setMessage('Invalid email or password');
      }

    } catch (error) {
      console.error('Error login:', error);
      setMessage('Erro ao realizar login. Tente novamente mais tarde.');
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
