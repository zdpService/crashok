// src/pages/Retrait.js
import React, { useState } from "react";
import { useAuth } from "../context/Context";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "../auth/firebase";
import { useNavigate } from "react-router-dom";

const Retrait = () => {
  const { currentUser, walletAmount, setWalletAmount } = useAuth();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const db = getFirestore(app);
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <p style={styles.infoText}>
        Vous devez être connecté pour effectuer un retrait.
      </p>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const retraitAmount = parseFloat(amount);

    if (isNaN(retraitAmount) || retraitAmount <= 0) {
      setError("Veuillez entrer un montant valide supérieur à 0.");
      return;
    }

    if (retraitAmount > walletAmount) {
      setError("Vous n'avez pas assez de solde pour ce retrait.");
      return;
    }

    try {
      await addDoc(collection(db, "retraits"), {
        userId: currentUser.uid,
        amount: retraitAmount,
        date: new Date(),
        status: "en attente",
      });

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        walletAmount: walletAmount - retraitAmount,
      });

      setWalletAmount(walletAmount - retraitAmount);

      setSuccessMsg(
        `Retrait de ${retraitAmount.toFixed(2)} ₣ effectué avec succès.`
      );
      setAmount("");
    } catch (error) {
      console.error("Erreur lors du retrait :", error);
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Demande de Retrait</h2>
      <p style={styles.balance}>
        Solde disponible : <strong>{walletAmount.toFixed(2)} ₣</strong>
      </p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label htmlFor="amount" style={styles.label}>
          Montant à retirer :
        </label>
        <input
          type="number"
          id="amount"
          placeholder="Ex: 500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          step="0.01"
          style={styles.input}
        />

        {error && <p style={styles.error}>{error}</p>}
        {successMsg && <p style={styles.success}>{successMsg}</p>}

        <button type="submit" style={styles.submitBtn}>
          Demander le retrait
        </button>
      </form>

      <button style={styles.backBtn} onClick={() => navigate("/")}>
        ← Retour à l'accueil
      </button>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "40px auto",
    padding: 30,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  title: {
    marginBottom: 20,
    fontSize: 28,
    color: "#222",
    textAlign: "center",
  },
  balance: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: "center",
    color: "#555",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    padding: "12px 15px",
    fontSize: 16,
    borderRadius: 8,
    border: "1.8px solid #ddd",
    marginBottom: 15,
    transition: "border-color 0.3s",
    outline: "none",
  },
  submitBtn: {
    padding: "12px 20px",
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "#1976d2",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
    transition: "background-color 0.3s",
  },
  backBtn: {
    marginTop: 25,
    display: "block",
    width: "100%",
    textAlign: "center",
    padding: "10px 15px",
    fontSize: 16,
    borderRadius: 8,
    border: "1.5px solid #1976d2",
    backgroundColor: "white",
    color: "#1976d2",
    cursor: "pointer",
    boxShadow: "inset 0 0 0 0 #1976d2",
    transition: "all 0.3s ease",
  },
  error: {
    color: "#d32f2f",
    marginBottom: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  success: {
    color: "#388e3c",
    marginBottom: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  infoText: {
    maxWidth: 400,
    margin: "40px auto",
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
};

export default Retrait;
