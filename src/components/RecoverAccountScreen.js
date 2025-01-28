import React, { useState } from "react";
import "../styles/RecoverAccountScreen.css";

function RecoverAccountScreen({ onRecover }) {
  const [email, setEmail] = useState("");

  const handleRecover = (e) => {
    e.preventDefault();
    if (email) {
      onRecover(email);
    }
  };

  return (
    <div className="recover-account-screen">
      <form onSubmit={handleRecover}>
        <h2>Recuperar Conta</h2>
        <p>Insira o email associado à sua conta. Enviaremos instruções para recuperar sua senha.</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default RecoverAccountScreen;
