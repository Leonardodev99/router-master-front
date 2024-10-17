import React, { useState, useEffect } from "react";
import Map from "./Map";
import "../styles/HomeScreen.css";

function HomeScreen({ routeInfo, setRouteInfo }) {
  const [showTransportOptions, setShowTransportOptions] = useState(false); // Controla exibição da caixa de diálogo
  const [selectedTransport, setSelectedTransport] = useState(""); // Armazena o transporte selecionado
  const [isWalkingStarted, setIsWalkingStarted] = useState(false); // Controla se a caminhada foi iniciada
  const [currentPosition, setCurrentPosition] = useState(null); // Posição de origem (capturada automaticamente)

  // Captura a posição atual automaticamente ao carregar o componente
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]); // Define a origem automaticamente
          setRouteInfo((prev) => ({ ...prev, start: [latitude, longitude] })); // Atualiza a origem no routeInfo
        },
        (error) => console.error("Erro ao capturar a localização:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocalização não é suportada por este navegador.");
    }
  }, [setRouteInfo]);

  // Função para iniciar a caminhada
  const startWalking = () => {
    if (selectedTransport) {
      setIsWalkingStarted(true); // Inicia o cronômetro e movimentação
      setShowTransportOptions(false); // Oculta a caixa de opções
    }
  };

  return (
    <div className="home-screen">
      <header>
        <h1>Selecione o seu destino</h1>
      </header>

      {/* Renderiza o mapa e só permite escolher o destino */}
      <Map setRouteInfo={setRouteInfo} currentPosition={currentPosition} isWalkingStarted={isWalkingStarted} />

      {/* Botão para perguntar sobre caminhada */}
      {!isWalkingStarted && (
        <button onClick={() => setShowTransportOptions(true)} className="start-walk-button">
          Deseja caminhar?
        </button>
      )}

      {/* Caixa de diálogo para selecionar transporte */}
      {showTransportOptions && (
        <div className="transport-dialog">
          <h3>Escolha seu modo de transporte</h3>
          <select onChange={(e) => setSelectedTransport(e.target.value)} value={selectedTransport}>
            <option value="">Selecione...</option>
            <option value="walking">A pé</option>
            <option value="cycling">Bicicleta</option>
            <option value="motorbike">Motocicleta</option>
            <option value="car">Automóvel</option>
          </select>
          <button onClick={startWalking} disabled={!selectedTransport} className="start-walk-button">
            Iniciar Caminhada
          </button>
        </div>
      )}

      {/* Exibe cronômetro e a seta para navegação */}
      {isWalkingStarted && <WalkingInterface />}
    </div>
  );
}

function WalkingInterface() {
  const [time, setTime] = useState(0); // Tempo de caminhada

  // Atualiza o cronômetro
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1); // Aumenta o tempo em 1 segundo
    }, 1000);
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, []);

  return (
    <div className="walking-interface">
      <h3>Cronômetro: {Math.floor(time / 60)}:{("0" + (time % 60)).slice(-2)}</h3>
    </div>
  );
}

export default HomeScreen;
