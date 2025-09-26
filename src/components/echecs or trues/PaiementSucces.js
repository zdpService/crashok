import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/Context";

const Recharge = () => {
  const { currentUser, refreshWalletAmount, walletAmount } = useAuth();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lancer le paiement
  const handleRecharge = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError("Vous devez être connecté.");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Veuillez entrer un montant valide.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/paiement/fusion-recharge",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            montant: parseFloat(amount),
            uid: currentUser.uid,
            nom: currentUser.displayName || "Client",
            email: currentUser.email,
            numeroSend: "01010101",
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || "Impossible de créer le paiement.");
      }
    } catch (err) {
      console.error(err);
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  };

  // Dès que l'utilisateur revient sur la page après paiement, on rafraîchit le solde
  useEffect(() => {
    if (currentUser) {
      refreshWalletAmount(); // récupère walletAmount depuis Firebase
    }
  }, [currentUser, refreshWalletAmount]);

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "2rem auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 12,
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 15 }}>
        Recharger mon solde
      </h2>

      <form onSubmit={handleRecharge}>
        <input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Montant (₣)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 15,
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 12,
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Chargement..." : "Recharger"}
        </button>

        {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
      </form>

      {/* Affichage du solde actuel */}
      <p style={{ marginTop: 15, textAlign: "center", fontWeight: "bold" }}>
        Solde actuel : {walletAmount} ₣
      </p>
    </div>
  );
};

export default Recharge;
