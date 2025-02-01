import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AddFriendScreen.css";

function AddFriendScreen() {
  const Navigate = useNavigate();
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (validateContact(contact)) {
      Navigate("/home");
      setContact("");
      setError("");
    } else {
      setError("Por favor, insira um e-mail ou telefone válido.");
    }
  };

  const validateContact = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/; // Aceita números de telefone com ou sem código do país
    return emailRegex.test(input) || phoneRegex.test(input);
  };

  return (
    <div className="add-friend-screen">
      <form onSubmit={handleAddFriend}>
        <h2>Adicionar Amigo</h2>
        <input
          type="text"
          placeholder="Digite o telefone ou e-mail"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}

export default AddFriendScreen;
