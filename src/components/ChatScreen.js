import React, { useState, useEffect } from "react";
import LessaScreen from "./LessaScreen";
import api from "./api"; // 🔐 Axios com token
import { useNavigate } from "react-router-dom";
import "../styles/ChatScreen.css";

function ChatScreen() {
  const [selectedFriend, setSelectedFriend] = useState(null);  
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [friendsList, setFriendsList] = useState([]);
  const navigate = useNavigate();

  // 🔄 Buscar contatos reais do backend
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get("/contacts");
        const usernames = response.data.map(c => c.contact.username);
        setFriendsList(["Assistente virtual - Lessa", ...usernames]);
      } catch (err) {
        console.error("Erro ao carregar contatos:", err);
        if (err.response?.status === 401) navigate("/login");
        else setFriendsList(["Assistente virtual - Lessa"]);
      }
    };
    fetchContacts();
  }, [navigate]);

  const handleFriendClick = (friend) => {
    if (friend === "Assistente virtual - Lessa") {
      setSelectedFriend("lessa");
    } else {
      setSelectedFriend(friend);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && selectedFriend) {
      setMessages((prev) => ({
        ...prev,
        [selectedFriend]: [...(prev[selectedFriend] || []), { text: input, sender: "user" }],
      }));
      setInput("");
      setTimeout(() => {
        setMessages((prev) => ({
          ...prev,
          [selectedFriend]: [...(prev[selectedFriend] || []), { text: "Resposta automática", sender: "bot" }],
        }));
      }, 1000);
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation && selectedFriend) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `Minha localização: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}`;
          setMessages((prev) => ({
            ...prev,
            [selectedFriend]: [
              ...(prev[selectedFriend] || []),
              { text: locationMessage, sender: "user" },
            ],
          }));
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
        }
      );
    }
  };

  return (
    <div className="chat-screen">
      {selectedFriend === "lessa" ? (
        <LessaScreen />
      ) : !selectedFriend ? (
        <div className="friends-list">
          <h2>Lista de Amigos</h2>
          {friendsList.map((friend, index) => (
            <button key={index} onClick={() => handleFriendClick(friend)}>
              {friend}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="chat-header">
            <button onClick={() => setSelectedFriend(null)} className="back-button">⬅</button>
            {selectedFriend}
          </div>
          <div className="chat-messages">
            {(messages[selectedFriend] || []).map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">Enviar</button>
            <button type="button" onClick={shareLocation} className="share-location">📍</button>
          </form>
        </>
      )}
    </div>
  );
}

export default ChatScreen;
