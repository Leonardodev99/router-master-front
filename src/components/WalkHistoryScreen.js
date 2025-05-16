// src/components/WalkHistoryScreen.js
import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import "../styles/WalkHistoryScreen.css";

function WalkHistoryScreen() {
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const addressCache = {};

  const reverseGeocode = async (coordString) => {
    if (addressCache[coordString]) return addressCache[coordString];
    if (!coordString) return "Desconhecido";
    const [lat, lng] = coordString.split(",").map(Number);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`
      );
      const data = await response.json();
      const displayName = data.display_name || "Endereço não encontrado";
      addressCache[coordString] = displayName;
      return displayName;
    } catch (error) {
      console.error("Erro ao obter endereço:", error);
      return "Erro ao obter endereço";
    }
  };
  

  useEffect(() => {
    const fetchWalks = async () => {
      try {
        const response = await api.get("/walks");
        const walksWithNames = await Promise.all(
          response.data.map(async (walk) => {
            const originName = await reverseGeocode(walk.origin);
            const destinationName = await reverseGeocode(walk.destination);
            return { ...walk, originName, destinationName };
          })
        );
        setWalks(walksWithNames);
      } catch (error) {
        console.error("Erro ao buscar caminhadas:", error);
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    

    fetchWalks();
  }, [navigate]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString("pt-PT", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const formatCoords = (coordString) => {
    if (!coordString) return "N/A";
    const [lat, lng] = coordString.split(",").map(Number);
    if (isNaN(lat) || isNaN(lng)) return "N/A";
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };
  

  return (
    <div className="walk-history-screen">
      <h2>Histórico de Caminhadas</h2>
      {loading ? (
        <p>Carregando...</p>
      ) : walks.length === 0 ? (
        <p>Nenhuma caminhada registrada.</p>
      ) : (
        <ul className="walk-list">
          {walks.map((walk) => (
            <li key={walk.id} className="walk-item">
              <p><strong>Data:</strong> {formatDate(walk.created_at)}</p>
              <p><strong>Origem:</strong> {walk.originName}</p>
              <p><strong>Destino:</strong> {walk.destinationName}</p>
              <p><strong>Transporte:</strong> {walk.transport_way}</p>
              {walk.distance && <p><strong>Distância:</strong> {walk.distance?.toFixed(2)} km</p>
            }
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WalkHistoryScreen;
