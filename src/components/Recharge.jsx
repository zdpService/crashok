import React, { useState, useEffect } from "react";
import { useAuth } from "../context/Context";
import emailjs from "emailjs-com";

const BACKEND_URL = "https://crash-backend-lkmn.onrender.com/api/paiement";

const Recharge = () => {
  const { currentUser, refreshWalletAmount, walletAmount } = useAuth();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ------------------- Création du paiement Money Fusion -------------------
  const handleRecharge = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) return setError("Vous devez être connecté.");
    if (!amount || parseFloat(amount) <= 0) return setError("Montant invalide");

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/fusion-recharge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montant: parseFloat(amount),
          uid: currentUser.uid,
          nom: currentUser.displayName || "Client",
          email: currentUser.email,
          numeroSend: "01010101",
        }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        // ✅ Envoi d'un email au moment où l'utilisateur demande une recharge
        await sendEmailNotification();

        // ✅ Redirection vers Money Fusion
        window.location.href = data.url;
      } else {
        setError(data.message || "Impossible de créer le paiement.");
      }
    } catch (err) {
      console.error("Erreur recharge:", err);
      setError("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------- Envoi d'un email avec EmailJS -------------------
  const sendEmailNotification = async () => {
    if (!currentUser) return;

    const templateParams = {
      user_name: currentUser.displayName || "Client",
      user_email: currentUser.email,
      user_uid: currentUser.uid,
      recharge_amount: amount,
      status: "En attente de validation",
    };

    try {
      await emailjs.send(
        "service_mp01vuq", // Remplace par ton Service ID
        "template_682kekc", // Remplace par ton Template ID
        templateParams,
        "26Fdu_8fY_tnmoyYd" // Remplace par ta clé publique
      );
      console.log("✅ Email envoyé à l'admin");
    } catch (error) {
      console.error("Erreur EmailJS:", error);
    }
  };

  // ------------------- Vérification du paiement -------------------
  const handleVerifyPayment = async () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token || !currentUser) return;

    try {
      const res = await fetch(`${BACKEND_URL}/fusion-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, uid: currentUser.uid }),
      });

      if (!res.ok) throw new Error("Erreur serveur lors de la vérification");

      const data = await res.json();

      if (data.success) {
        alert(`✅ Paiement réussi ! Nouveau solde : ${data.newWallet} ₣`);
        await refreshWalletAmount();
      } else {
        alert("❌ Le paiement n'a pas été validé.");
      }
    } catch (err) {
      console.error("Erreur vérification paiement:", err);
      alert("❌ Erreur de communication avec le serveur.");
    }
  };

  useEffect(() => {
    handleVerifyPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  return (
    <form
      onSubmit={handleRecharge}
      style={{
        maxWidth: 400,
        margin: "5rem auto",
        padding: 20,
        border: "1px solid #ccc",
        borderRadius: 12,
        backgroundColor: "#fff",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 15 }}>
        Recharger mon solde
      </h2>

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

      {currentUser && (
        <p style={{ marginTop: 10, textAlign: "center" }}>
          Solde actuel : <strong>{walletAmount} ₣</strong>
        </p>
      )}
    </form>
  );
};

export default Recharge;
