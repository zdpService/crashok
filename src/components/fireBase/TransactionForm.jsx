import React, { useState } from "react";
import { db } from "../../auth/firebase"; // Assurez-vous que Firebase est bien initialisé
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const TransactionForm = ({ type, user, onClose }) => {
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "transactions"), {
        type,
        user: user.email,
        amount: parseFloat(amount),
        createdAt: serverTimestamp(),
      });
      alert("Transaction enregistrée !");
      onClose();
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de l'enregistrement.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="number"
        placeholder="Montant"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <button type="submit">Confirmer</button>
      <button type="button" onClick={onClose}>
        Annuler
      </button>
    </form>
  );
};

export default TransactionForm;
