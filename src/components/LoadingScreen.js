import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logorm.jpg";
import "../styles/LoadingScreen.css";

function LoadingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000); // Simula carregamento por 3 segundos
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="loading-screen">
        <div className="loader">
          <img src={logo} alt="App Logo" className="logo" />
          <p>Carregando...</p>
        </div>
    </div>
  );
}

export default LoadingScreen;
