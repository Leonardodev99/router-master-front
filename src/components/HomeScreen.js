import React, { useState, useEffect, useRef } from "react";
import Map from "./Map";
import api from "./api";
import { useNavigate } from "react-router-dom";
import "../styles/HomeScreen.css";

function HomeScreen({ routeInfo, setRouteInfo }) {
  const navigate = useNavigate(); // Usando React Router para navegação
  const [showTransportOptions, setShowTransportOptions] = useState(false); // Controla exibição da caixa de diálogo
  const [selectedTransport, setSelectedTransport] = useState(""); // Armazena o transporte selecionado
  const [isWalkingStarted, setIsWalkingStarted] = useState(false); // Controla se a caminhada foi iniciada
  const [currentPosition, setCurrentPosition] = useState(null); // Posição de origem (capturada automaticamente)
  const [walkingTime, setWalkingTime] = useState(0); // Tempo de caminhada
  const [distanceTravelled, setDistanceTravelled] = useState(0); // Distância percorrida
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null); 
  const [lastPosition, setLastPosition] = useState(null); // Última posição registrada para calculo de distância
  
  // Captura a posição atual automaticamente ao carregar o componente
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = [latitude, longitude];
          setCurrentPosition(newPosition);
          handlePositionChange(newPosition);
        },
        (error) => console.error("Erro ao capturar a localização:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocalização não é suportada por este navegador.");
    }
  }, [isWalkingStarted, routeInfo.end]);
  

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

      // Handle closing profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    // Bind the event listener only when the menu is open
    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    // Cleanup function to remove listener on unmount or when menu closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const registerWalk = async () => {
    if (!routeInfo.start || !routeInfo.end || !selectedTransport) return;
  
    const walkData = {
      origin: { lat: routeInfo.start[0], lng: routeInfo.start[1] },
      destination: { lat: routeInfo.end[0], lng: routeInfo.end[1] },
      transport_way: mapTransport(selectedTransport),
    };
    console.log("Dados enviados:", walkData);
  
    try {
      const response = await api.post("/walks", walkData);
      console.log("Caminhada registrada com sucesso:", response.data);
    } catch (error) {
      console.error("Erro ao registrar caminhada:", error.response?.data || error.message);
    }
  };
  
  const mapTransport = (transport) => {
    switch (transport) {
      case "walking": return "byFoot";
      case "car": return "car";
      case "motorbike": return "motobike";
      case "cycling": return "bike";
      default: return "byFoot";
    }
  };
  

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

    // Verifica se está perto ou chegou ao destino
    const destination = routeInfo.end;
    if (destination) {
      const distanceToDestination = calculateDistance(newPosition, destination);

      if (distanceToDestination < 10) { // Menos de 10 metros: destino alcançado
        speak("Você chegou ao seu destino.");
        setIsWalkingStarted(false); // Para o cronômetro
        registerWalk();
      } else if (distanceToDestination < 50) { // Entre 10 e 50 metros: perto do destino
        speak("Você está quase chegando ao seu destino.");
      }
    }
  }
};


 // Function to handle logout (add your actual logout logic here)
 const handleLogout = () => {
  console.log("Terminar Sessão clicado");
  // Add actual logout logic (e.g., clear tokens, reset state)
  setIsProfileMenuOpen(false); // Close menu
  navigate("/login"); // Redirect to login page
};
 
  return (
    <div className="home-screen">
       <header>
        <h1>Selecione o seu destino</h1>
        <nav className="menu-bar">
          {/* --- Navigation Links --- */}
          <span className="menu-link" onClick={() => navigate("/SeeTraffic")}>
            Ver Trânsito
          </span>
          <span className="menu-link" onClick={() => navigate("/hostory")}>
            Minhas corridas
          </span>
          <span className="menu-link" onClick={() => navigate("/add-friend")}>
            Adicionar Amigo
          </span>
          <span className="menu-link" onClick={() => navigate("/chat")}>
            Chat
          </span>
          <span className="menu-link" onClick={() => navigate("/weather")}>
            Meteorologia
          </span>

          {/* --- Profile Menu Dropdown --- */}
          <div className="profile-menu-container" ref={profileMenuRef}>
            <span className="menu-link" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
              Perfil ▾ {/* Down arrow indicator */}
            </span>
            {isProfileMenuOpen && (
              <div className="profile-menu">
                <span
                  className="profile-menu-item"
                  onClick={() => {
                    navigate('/profile'); 
                    setIsProfileMenuOpen(false); 
                  }}
                >
                  Ver Perfil
                </span>
                <span
                  className="profile-menu-item"
                  onClick={() => navigate("/login")}
                >
                  Terminar Sessão
                </span>
              </div>
            )}
          </div>
        </nav>
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
