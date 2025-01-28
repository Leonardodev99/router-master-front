import React, { useState } from "react";
import LoadingScreen from "./components/LoadingScreen";
import LoginScreen from "./components/LoginScreen";
import HomeScreen from "./components/HomeScreen";
import SignupScreen from "./components/SignupScreen";
import RecoverAccountScreen from "./components/RecoverAccountScreen";

function App() {
  const [routeInfo, setRouteInfo] = useState({
    start: null, // Inicializa como null, pois será selecionado pelo usuário
    end: null,   // Inicializa como null, pois será selecionado pelo usuário
    mode: "pedestrian", // Modo padrão
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("login");

  // Função chamada quando a tela de carregamento finaliza
  const handleLoaded = () => {
    setIsLoading(false);
  };

  // Função chamada quando o login for bem-sucedido
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleSignup = () => {
    setCurrentScreen("login");
  }

  return (
    <div className="App">
      {/* Tela de carregamento */}
      {isLoading ? (
        <LoadingScreen onLoaded={handleLoaded} />
      ) : currentScreen === "login" && !isLoggedIn ? (
        <LoginScreen 
        onLogin={handleLogin}
        onNavigateToSignup={() => setCurrentScreen('signup')}
        onNavigateToRecover={() => setCurrentScreen("recover")} 
        />
      ) : currentScreen === "signup" ? (
        <SignupScreen onSignup={handleSignup}/>
      ) : currentScreen === "recover" ? (
        <RecoverAccountScreen onRecover={(email) => alert(`Instruções enviadas para: ${email}`)}/>
      ): (
        /* Tela principal após o login */
        <div>
          <HomeScreen routeInfo={routeInfo} setRouteInfo={setRouteInfo} />
          {/* Exibe as coordenadas de origem e destino depois que o usuário as selecionar */}
          {routeInfo.start && routeInfo.end && (
            <div>
              <h2>Origem: {routeInfo.start.join(", ")}</h2>
              <h2>Destino: {routeInfo.end.join(", ")}</h2>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
