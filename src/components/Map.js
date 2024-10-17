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

function Map({ setRouteInfo, isWalkingStarted }) {
  const [markers, setMarkers] = useState({ start: null, end: null });
  const [polyline, setPolyline] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null); // Posição do dispositivo

  // Função para lidar com os cliques no mapa
  function LocationSelector() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        if (!markers.start) {
          setMarkers({ start: [lat, lng], end: null });
        } else if (!markers.end) {
          setMarkers((prev) => ({ ...prev, end: [lat, lng] }));
        }
      },
    });

    return null;
  }

  // Atualiza `routeInfo` e a rota quando origem e destino estão definidos
  useEffect(() => {
    if (markers.start && markers.end) {
      setRouteInfo({ start: markers.start, end: markers.end });
      setPolyline([markers.start, markers.end]);
    }
  }, [markers, setRouteInfo]);

  // Movimenta a seta no mapa conforme a posição do dispositivo
  useEffect(() => {
    if (isWalkingStarted) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition([latitude, longitude]); // Atualiza a posição no mapa
        },
        (error) => {
          console.error("Erro na geolocalização:", error);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId); // Limpa o watch quando parar
    }
  }, [isWalkingStarted]);

  return (
    <div className="map-container">
      <MapContainer
        center={[-8.8383, 13.2344]} // Centralizado em Luanda, Angola
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Selecionador de local */}
        <LocationSelector />

        {/* Exibe o marcador de origem */}
        {markers.start && <Marker position={markers.start} />}

        {/* Exibe o marcador de destino */}
        {markers.end && <Marker position={markers.end} />}

        {/* Desenha a rota se houver origem e destino */}
        {polyline.length > 0 && <Polyline positions={polyline} color="red" weight={4} />}

        {/* Seta indicando posição atual do dispositivo */}
        {currentPosition && (
          <Marker position={currentPosition} icon={new L.Icon.Default()}>
            <span className="direction-arrow">→</span>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Map;
