import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api"; 
import "../styles/AddFriendScreen.css";

function AddFriendScreen() {
  const navigate = useNavigate();
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateContact(contact)) {
      setError("Por favor, insira um telefone válido.");
      return;
    }

    try {
      await api.post("/contacts", { phone: contact });
      setSuccess("Contato adicionado com sucesso!");
      setContact("");

      setTimeout(() => navigate("/home"), 1500); // Redireciona após sucesso
    } catch (err) {
      const msg = err.response?.data?.errors?.[0] || "Erro ao adicionar contato.";
      setError(msg);
    }
  };

  const validateContact = (input) => {
    const phoneRegex = /^\d{3} \d{3} \d{3}$/; 
    return phoneRegex.test(input);
  };

  return (
    <div className="add-friend-screen">
      <form onSubmit={handleAddFriend}>
        <h2>Adicionar Amigo</h2>
        <input
          type="text"
          placeholder="Digite o telefone (ex. 930 123 456)"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}

export default AddFriendScreen;
