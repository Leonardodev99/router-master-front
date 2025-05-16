import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import "../styles/Map.css";
import axios from "axios"; // Para chamadas HTTP

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
  const [heatmapPoints, setHeatmapPoints] = useState([]); // Armazena os pontos do heatmap

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

  // Captura a localização contínua durante a caminhada e atualiza o heatmap
  useEffect(() => {
    if (isWalkingStarted) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = [latitude, longitude];

          setCurrentDevicePosition(newPosition); // Atualiza a posição do dispositivo
          onPositionChange(newPosition); // Envia a nova posição para o componente pai

          // Adiciona a nova posição ao heatmap
          setHeatmapPoints((prevPoints) => [...prevPoints, [...newPosition, 1]]); // [latitude, longitude, intensidade]
        },
        (error) => console.error("Erro na geolocalização:", error),
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId); // Limpa o watch quando parar
    }
  }, [isWalkingStarted, onPositionChange]);

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

  // Atualiza a rota quando origem e destino são definidos
  useEffect(() => {
    if (markers.start && markers.end) {
      setRouteInfo({ start: markers.start, end: markers.end });
      fetchRoute(markers.start, markers.end); // Busca a rota detalhada
    }
  }, [markers, setRouteInfo]);

  // Busca a rota detalhada usando a OpenRouteService API
  const fetchRoute = async (start, end) => {
    try {
      const apiKey = "5b3ce3597851110001cf6248cdea24e743e74caea72a6f55686eb609"; // Substitua pela sua chave de API da OpenRouteService
      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/foot-walking`,
        {
          params: {
            api_key: apiKey,
            start: `${start[1]},${start[0]}`, // Longitude, Latitude
            end: `${end[1]},${end[0]}`,     // Longitude, Latitude
          },
        }
      );

      const coordinates = response.data.features[0].geometry.coordinates;
      const route = coordinates.map(([lng, lat]) => [lat, lng]); // Converter para formato [lat, lng]
      setPolyline(route); // Atualiza a rota no mapa
      setRouteIndex(0); // Reseta o índice
    } catch (error) {
      console.error("Erro ao buscar a rota:", error);
    }
  };



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
      center={currentPosition || [-8.8383, 13.2344]} // Centraliza no local atual ou padrão
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Selecionador de destino */}
      <DestinationSelector />

      {/* Marcadores e rota */}
      {markers.start && <Marker position={markers.start} icon={new L.Icon.Default()} />}
      {markers.end && <Marker position={markers.end} icon={new L.Icon.Default()} />}
      {polyline.length > 0 && <Polyline positions={polyline} color="red" weight={4} />}

      {/* Posição simulada */}
      {currentSimulatedPosition && <Marker position={currentSimulatedPosition} />}

      {/* Heatmap Layer */}
      {heatmapPoints.length > 0 && (
          <HeatmapLayer
            points={heatmapPoints}
            radius={25}
            blur={15}
            maxZoom={17}
          />
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

// Componente do HeatmapLayer
function HeatmapLayer({ points, radius, blur, maxZoom }) {
  const map = useMapEvents({});

  useEffect(() => {
    const heatLayer = L.heatLayer(points, { radius, blur, maxZoom }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points, radius, blur, maxZoom]);

  return null;
}

export default Map;
