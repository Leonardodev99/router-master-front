import React, { useState, useEffect } from "react";
import Map from "./Map";
import "../styles/HomeScreen.css";

function HomeScreen({ routeInfo, setRouteInfo }) {
  const [showTransportOptions, setShowTransportOptions] = useState(false); // Controla exibição da caixa de diálogo
  const [selectedTransport, setSelectedTransport] = useState(""); // Armazena o transporte selecionado
  const [isWalkingStarted, setIsWalkingStarted] = useState(false); // Controla se a caminhada foi iniciada
  const [currentPosition, setCurrentPosition] = useState(null); // Posição de origem (capturada automaticamente)
  const [walkingTime, setWalkingTime] = useState(0); // Tempo de caminhada
  const [distanceTravelled, setDistanceTravelled] = useState(0); // Distância percorrida
  const [lastPosition, setLastPosition] = useState(null); // Última posição registrada para calculo de distância
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

      // Inicia a contagem do tempo e rastreamento da distância
      useEffect(() => {
        let intervalId;
    
        if (isWalkingStarted) {
          intervalId = setInterval(() => {
            setWalkingTime((prevTime) => prevTime + 1);
          }, 1000);
        }
        return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
      }, [isWalkingStarted]);

  // Função para iniciar a caminhada
  const startWalking = () => {
    if (selectedTransport && currentPosition) {
      setIsWalkingStarted(true);
      setShowTransportOptions(false);
      setLastPosition(currentPosition); // Define a posição inicial para calculo de distancia
      speak(`Caminhada iniciada! Modo de transporte: ${selectedTransport}. Vamos começar!`);
    }
  };

  // Função para o assistente de voz (sintetização de fala)
  const speak = (text) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-PT"; // Definir para português de Portugal, pode ajustar conforme necessário
    synth.speak(utterance);
  };

   // Calcula a distancia percorrida e atualiza o estado
   const updateDistance = (newPosition) => {
    if (lastPosition) {
      const dist = calculateDistance(lastPosition, newPosition);
      setDistanceTravelled((prevDistance) => prevDistance + dist);
    }
    setLastPosition(newPosition);
  };

  const handlePositionChange = (newPosition) => {
    if (isWalkingStarted) {
        updateDistance(newPosition);
      }
  };

  return (
    <div className="home-screen">
      <header>
        <h1>Selecione o seu destino</h1>
      </header>

      {/* Renderiza o mapa e só permite escolher o destino */}
      <Map 
        setRouteInfo={setRouteInfo} 
        currentPosition={currentPosition} 
        isWalkingStarted={isWalkingStarted} 
        onPositionChange={handlePositionChange}
        />

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
      {isWalkingStarted && (
          <WalkingInterface
              time={walkingTime}
              distance={distanceTravelled}
              speak={speak}
          />
      )}
    </div>
  );
}

function WalkingInterface({ time, distance, speak }) {
  // Feedback de voz a cada minuto
    useEffect(() => {
      if (time % 60 === 0 && time > 0) {
        speak(`Você está caminhando há ${Math.floor(time / 60)} minutos.`);
      }
    }, [time, speak]);

    return (
      <div className="walking-interface">
          <h3>Cronômetro: {Math.floor(time / 60)}:{("0" + (time % 60)).slice(-2)}</h3>
          <h3>Distância: {(distance / 1000).toFixed(2)} km</h3>
      </div>
  );
}

// Função para calcular distância entre duas coordenadas (Haversine)
function calculateDistance(coord1, coord2) {
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  const earthRadiusKm = 6371; // Raio da Terra em quilômetros

  const lat1Rad = toRadians(coord1[0]);
  const lon1Rad = toRadians(coord1[1]);
  const lat2Rad = toRadians(coord2[0]);
  const lon2Rad = toRadians(coord2[1]);

  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c * 1000; // Retorna a distância em metros
}


export default HomeScreen;
