import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import "../styles/TrafficMapScreen.css"; // ✅ para estilos da legenda/histórico

const basePoints = [
  [-8.8383, 13.2344],
  [-8.835, 13.23],
  [-8.837, 13.238],
  [-8.84, 13.232],
  [-8.8395, 13.236],
];

function DynamicHeatLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    const heatLayer = L.heatLayer(points, {
      radius: 100,
      blur: 40,
      maxZoom: 17,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

const TrafficMapScreen = () => {
  const [heatPoints, setHeatPoints] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    document.title = "Trânsito Simulado com Leaflet";
  }, []);

  useEffect(() => {
    const generateHeat = () => {
      const dynamicPoints = basePoints.map(([lat, lng]) => [
        lat,
        lng,
        parseFloat((Math.random() * 0.7 + 0.3).toFixed(2)), // intensidade entre 0.3 e 1.0
      ]);
      setHeatPoints(dynamicPoints);
      setHistory((prev) => [
        { timestamp: new Date().toLocaleTimeString(), points: dynamicPoints },
        ...prev.slice(0, 4),
      ]);
    };

    generateHeat();
    const interval = setInterval(generateHeat, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <h2 style={{ textAlign: "center" }}>Trânsito em Tempo Real - Simulação 🛣️</h2>

      <div className="traffic-ui">
        <div className="legend">
          <h4>Legenda</h4>
          <div><span className="dot green" /> Leve (0.3 - 0.5)</div>
          <div><span className="dot yellow" /> Moderado (0.5 - 0.8)</div>
          <div><span className="dot red" /> Intenso (0.8 - 1.0)</div>
        </div>

        <div className="history">
          <h4>Últimas Leituras</h4>
          <ul>
            {history.map((h, idx) => (
              <li key={idx}>
                <strong>{h.timestamp}</strong> – intensidades: {h.points.map(p => p[2]).join(", ")}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <MapContainer
        center={[-8.8383, 13.2344]}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "90%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <DynamicHeatLayer points={heatPoints} />
      </MapContainer>
    </div>
  );
};

export default TrafficMapScreen;
