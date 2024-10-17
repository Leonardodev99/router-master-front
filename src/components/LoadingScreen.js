import React, { useEffect, useState } from "react";
import logo from "../assets/logorm.jpg";
import "../styles/LoadingScreen.css";

function LoadingScreen({ onLoaded }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      onLoaded();
    }, 3000); // Simula carregamento por 3 segundos
    return () => clearTimeout(timer);
  }, [onLoaded]);

  return (
    <div className="loading-screen">
      {loading && (
        <div className="loader">
          <img src={logo} alt="App Logo" className="logo" />
          <p>Carregando...</p>
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;
