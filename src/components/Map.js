import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";

// Configurar ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function Map({ setRouteInfo, isWalkingStarted, onPositionChange, currentPosition  }) {
  const [markers, setMarkers] = useState({ start: null, end: null });
  const [polyline, setPolyline] = useState([]);
  const [currentDevicePosition, setCurrentDevicePosition] = useState(currentPosition); // Posição atual do dispositivo
  const [currentSimulatedPosition, setCurrentSimulatedPosition] = useState(currentPosition); // Posição simulada do dispositivo
  const [mapCenter, setMapCenter] = useState([-8.8383, 13.2344]); // Coordenadas padrão (Luanda)
  const [routeIndex, setRouteIndex] = useState(0); // Índice da posição atual na rota

  // Captura a localização atual automaticamente ao carregar o componente (origem)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentLocation = [latitude, longitude];

          setMarkers((prev) => ({ ...prev, start: currentLocation })); // Define a origem automaticamente
          setMapCenter(currentLocation); // Centraliza o mapa na localização atual
          setRouteInfo((prev) => ({ ...prev, start: currentLocation })); // Atualiza a origem no routeInfo
        },
        (error) => {
          console.error("Erro ao capturar a localização:", error);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocalização não é suportada por este navegador.");
    }
  }, [setRouteInfo]);

  // Função para lidar com o clique no mapa para selecionar o destino
  function handleMapClick(e) {
    const { lat, lng } = e.latlng;
    if (!markers.end) {
      setMarkers((prev) => ({ ...prev, end: [lat, lng] })); // Apenas o destino é selecionado
    }
  }

   // Função para selecionar o destino ao clicar no mapa
   function DestinationSelector() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (!markers.end) {
          setMarkers((prev) => ({ ...prev, end: [lat, lng] })); // Define o destino
        }
      },
    });
    return null;
  }

  // Atualiza `routeInfo` e a rota quando a origem e o destino são definidos
  useEffect(() => {
    if (markers.start && markers.end) {
      setRouteInfo({ start: markers.start, end: markers.end });
       // Cria uma rota com mais pontos usando a função `createRoute`
       const detailedRoute = createRoute(markers.start, markers.end, 100); // 100 pontos na rota
       setPolyline(detailedRoute);
       setRouteIndex(0); // Reseta o índice ao criar uma nova rota
    }
  }, [markers, setRouteInfo]);



  // Movimenta a seta no mapa conforme a posição do dispositivo (durante a caminhada)
  useEffect(() => {
    if (isWalkingStarted) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentDevicePosition([latitude, longitude]); // Atualiza a posição no mapa
        },
        (error) => {
          console.error("Erro na geolocalização:", error);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId); // Limpa o watch quando parar
    }
  }, [isWalkingStarted]);


   // Simulação de movimentação ao longo da rota
   useEffect(() => {
    if (isWalkingStarted && polyline.length > 0) {
      const interval = setInterval(() => {
          if(routeIndex < polyline.length) {
            const nextPosition = polyline[routeIndex];
            setCurrentSimulatedPosition(nextPosition); // Atualiza a posição simulada
            onPositionChange(nextPosition); // Envia a nova posição para o componente pai
            setRouteIndex(prev => prev + 1);
           
         } else {
              clearInterval(interval); // Para quando chega ao fim da rota
          }

        }, 1000);
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar
    }
}, [isWalkingStarted, polyline, onPositionChange, routeIndex]);
  

  return (
    <div className="map-container">
      <MapContainer
        center={mapCenter} // Centraliza no local atual do usuário
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        whenCreated={(map) => {
          map.on('click', handleMapClick); // Captura o clique para selecionar o destino
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

         {/* Componente para selecionar o destino ao clicar no mapa */}
         <DestinationSelector />
        
        
        {/* Exibe o marcador de origem capturada automaticamente */}
        {markers.start && <Marker position={markers.start} icon={new L.Icon.Default()} />}

        {/* Exibe o marcador de destino selecionado pelo usuário */}
        {markers.end && <Marker position={markers.end} icon={new L.Icon.Default()} />}

        {/* Desenha a rota se houver origem e destino */}
        {polyline.length > 0 && <Polyline positions={polyline} color="red" weight={4} />}

        {/* Seta indicando a posição simulada do usuário durante a caminhada */}
        {currentSimulatedPosition && (
          <Marker position={currentSimulatedPosition} icon={new L.Icon.Default()}>
            <span className="direction-arrow">→</span>
          </Marker>

        )}
      </MapContainer>
    </div>
  );
}

 // Função para criar uma rota com mais pontos entre duas coordenadas
 function createRoute(start, end, numPoints) {
  const route = [];
  for (let i = 0; i <= numPoints; i++) {
    const lat = start[0] + (end[0] - start[0]) * (i / numPoints);
    const lng = start[1] + (end[1] - start[1]) * (i / numPoints);
    route.push([lat, lng]);
  }
  return route;
}

export default Map;
