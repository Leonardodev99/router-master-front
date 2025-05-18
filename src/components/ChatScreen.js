import React, { useState, useEffect, useRef } from "react";
import LessaScreen from "./LessaScreen";
import api from "./api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../styles/ChatScreen.css";

function ChatScreen() {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [friendsList, setFriendsList] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  // Carregar contatos
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get("/contacts");
        const usernames = response.data.map((c) => c.contact.username);
        setFriendsList(["Assistente virtual - Lessa", ...usernames]);
      } catch (err) {
        console.error("Erro ao carregar contatos:", err);
        if (err.response?.status === 401) navigate("/login");
        else setFriendsList(["Assistente virtual - Lessa"]);
      }
    };
    fetchContacts();
  }, [navigate]);

  // Conectar WebSocket
  useEffect(() => {
    const token = localStorage.getItem("token");
    const newSocket = io("http://localhost:3005", {
      auth: { token },
    });

    newSocket.on("receive_message", ({ sender, text }) => {
      setMessages((prev) => ({
        ...prev,
        [sender]: [...(prev[sender] || []), { text, sender: "friend" }],
      }));
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => newSocket.disconnect();
  }, []);

  // Selecionar amigo e buscar histórico
  const handleFriendClick = async (friend) => {
    if (friend === "Assistente virtual - Lessa") {
      setSelectedFriend("lessa");
      return;
    }

    try {
      const response = await api.get(`/messages/${friend}`);
      const chatHistory = response.data.map((msg) => ({
        text: msg.text,
        sender: msg.sender_id === getCurrentUserId() ? "user" : "friend",
      }));

      setMessages((prev) => ({
        ...prev,
        [friend]: chatHistory,
      }));

      setSelectedFriend(friend);
    } catch (err) {
      console.error("Erro ao buscar histórico de mensagens:", err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedFriend || !socket) return;

    setMessages((prev) => ({
      ...prev,
      [selectedFriend]: [...(prev[selectedFriend] || []), { text: input, sender: "user" }],
    }));

    socket.emit("send_message", {
      recipient: selectedFriend,
      text: input,
    });

    setInput("");
  };

  const shareLocation = () => {
    if (navigator.geolocation && selectedFriend && socket) {
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

          socket.emit("send_message", {
            recipient: selectedFriend,
            text: locationMessage,
          });
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
        }
      );
    }
  };

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch (err) {
      return null;
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
