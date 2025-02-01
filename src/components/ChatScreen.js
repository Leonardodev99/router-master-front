import React, { useState } from "react";
import LessaScreen from "./LessaScreen";
import "../styles/ChatScreen.css";

const friendsList = [
    "Assistente virtual - Lessa",
    "João",
    "Maria",
    "Carlos",
    "Ana",
    "Pedro",
  ];

function ChatScreen() {
  const [selectedFriend, setSelectedFriend] = useState(null);  
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");

  const handleFriendClick = (friend) => {
    if (friend === "Assistente virtual - Lessa") {
        setSelectedFriend("lessa"); // Define um valor especial para indicar que a Lessa foi selecionada
    } else {
        setSelectedFriend(friend);
    }
};
  
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && selectedFriend) {
      setMessages((prevMessages) => {
        const newMessages = { ...prevMessages };
        newMessages[selectedFriend] = [
          ...(newMessages[selectedFriend] || []),
          { text: input, sender: "user" },
        ];
        return newMessages;
      });
      setInput("");
      setTimeout(() => {
        setMessages((prevMessages) => {
          const newMessages = { ...prevMessages };
          newMessages[selectedFriend] = [
            ...(newMessages[selectedFriend] || []),
            { text: "Resposta automática", sender: "bot" },
          ];
          return newMessages;
        });
      }, 1000);
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation && selectedFriend) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `Minha localização: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}`;
          setMessages((prevMessages) => {
            const newMessages = { ...prevMessages };
            newMessages[selectedFriend] = [
              ...(newMessages[selectedFriend] || []),
              { text: "Compartilhando localização...", sender: "user" },
            ];
            return newMessages;
          });
          
          setTimeout(() => {
            setMessages((prevMessages) => {
              const newMessages = { ...prevMessages };
              newMessages[selectedFriend] = [
                ...(newMessages[selectedFriend] || []),
                { text: locationMessage, sender: "user" },
              ];
              return newMessages;
            });
          }, 500);
        }, 
        (position) => {
          const { latitude, longitude } = position.coords;
          const locationMessage = `Minha localização: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}`;
          setMessages((prevMessages) => {
            const newMessages = { ...prevMessages };
            newMessages[selectedFriend] = [
              ...(newMessages[selectedFriend] || []),
              { text: locationMessage, sender: "user" },
            ];
            return newMessages;
          });
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

