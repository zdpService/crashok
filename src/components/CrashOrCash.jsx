// src/components/CrashOrCash.js
import React, { useState, useEffect, useRef } from "react";
import "./CrashOrCash.css";
import ParieursList from "./ParieursList";
import { useAuth } from "../context/Context"; // Import du contexte
import { getFirestore, doc, getDoc } from "firebase/firestore";

const generateBiasedCrash = () => {
  const r = Math.random();
  if (r < 0.7) return +(Math.random() * 3.9 + 0.1).toFixed(2);
  return +(Math.random() * 16 + 4).toFixed(2);
};

const generateMaskedId = () => {
  const rawId = Math.floor(10000000 + Math.random() * 90000000).toString();
  return `${rawId.slice(0, 2)}****${rawId.slice(6)}`;
};

const generateParieurs = () => {
  const count = Math.floor(Math.random() * 120) + 480;
  return Array.from({ length: count }, () => ({
    id: generateMaskedId(),
    montant: +(Math.random() * 999 + 1).toFixed(2),
  }));
};

const CrashOrCash = () => {
  const {
    walletAmount,
    setWalletAmount,
    updateWalletInFirestore,
    currentUser,
  } = useAuth();

  const [multiplier, setMultiplier] = useState(1);
  const [targetCrash, setTargetCrash] = useState(generateBiasedCrash());
  const [hasExploded, setHasExploded] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showBetWindow, setShowBetWindow] = useState(false);

  const [betAmount, setBetAmount] = useState("");
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [hasCollected, setHasCollected] = useState(false);

  const [error, setError] = useState(null);
  const [gain, setGain] = useState(null);

  const [parieurs, setParieurs] = useState(generateParieurs());

  const rocketRef = useRef(null);
  const animationIdRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const colorTimeoutRef = useRef(null);

  const db = getFirestore();

  // ✅ Fonction pour rafraîchir le solde depuis Firestore
  const refreshWallet = async () => {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const newWallet = snapshot.data().walletAmount || 0;
        setWalletAmount(newWallet);
      }
    }
  };

  // Rafraîchir le solde à chaque démarrage du composant
  useEffect(() => {
    refreshWallet();
  }, [currentUser]);

  // Faire disparaître le message de gain après 5 secondes
  useEffect(() => {
    if (gain) {
      const timer = setTimeout(() => {
        setGain(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gain]);

  // Animation fusée
  useEffect(() => {
    let startTime;
    const maxLeftPercent = 50;
    const centerBottomPercent = 50;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      const newMultiplier = +(1 + elapsed * 0.6).toFixed(2);

      if (newMultiplier >= targetCrash) {
        setHasExploded(true);
        setShowColors(true);
        setShowBetWindow(true);
        setCountdown(10);

        if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current);
        colorTimeoutRef.current = setTimeout(() => {
          setShowColors(false);
        }, 7000);

        cancelAnimationFrame(animationIdRef.current);
        return;
      }

      setMultiplier(newMultiplier);

      const t = elapsed * 0.1;
      const x = Math.min(t * 100, maxLeftPercent);
      const y =
        x < maxLeftPercent
          ? Math.min(t * 100 + 2, centerBottomPercent)
          : centerBottomPercent;

      if (rocketRef.current) {
        rocketRef.current.style.left = `${x}%`;
        rocketRef.current.style.bottom = `${y}%`;
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animationIdRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationIdRef.current);
  }, [targetCrash]);

  // Démarrage du compte à rebours après crash
  useEffect(() => {
    if (showBetWindow) {
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleReplay();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdownIntervalRef.current);
  }, [showBetWindow]);

  // Validation montant pari
  useEffect(() => {
    setError(null);
    const bet = parseFloat(betAmount);

    if (betAmount === "") {
      setError(null);
      return;
    }

    if (isNaN(bet) || bet < 250) {
      setError("Le montant minimum du pari est de 250.");
      return;
    }

    if (bet > walletAmount) {
      setError("Solde insuffisant pour ce montant.");
      return;
    }
  }, [betAmount, walletAmount]);

  // ✅ Soumission pari
  const handleBetSubmit = async (e) => {
    e.preventDefault();
    setGain(null);

    const bet = parseFloat(betAmount);
    if (walletAmount <= 0) {
      setError("❌ Solde insuffisant pour parier.");
      return;
    }
    if (isNaN(bet) || bet < 250) {
      setError("Le montant minimum du pari est de 250.");
      return;
    }
    if (bet > walletAmount) {
      setError("Fonds insuffisants pour ce pari.");
      return;
    }
    if (!showBetWindow) {
      setError("Le pari est possible uniquement après le crash !");
      return;
    }

    const newAmount = walletAmount - bet;
    setWalletAmount(newAmount);
    if (currentUser) {
      await updateWalletInFirestore(currentUser.uid, newAmount);
    }
    setHasPlacedBet(true);
    setHasCollected(false);
    setError(null);
    setGain("Pari placé, bonne chance !");
  };

  // ✅ Effet sonore Cash Out
  const playCashOutSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  };

  // ✅ Récupérer les gains
  const handleCollectGain = async () => {
    if (!hasPlacedBet || hasCollected) return;

    const bet = parseFloat(betAmount);
    if (isNaN(bet) || bet <= 0) return;

    const amountWon = +(bet * multiplier).toFixed(2);
    const newAmount = walletAmount + amountWon;
    setWalletAmount(newAmount);
    if (currentUser) {
      await updateWalletInFirestore(currentUser.uid, newAmount);
    }
    setGain(`🎉 Gain récupéré : ${amountWon} ₣ (x${multiplier.toFixed(2)})`);
    setHasCollected(true);
    setHasPlacedBet(false);
    setBetAmount("");

    playCashOutSound();
    refreshWallet(); // ✅ Rafraîchir après cash out
  };

  // ✅ Rejouer
  const handleReplay = () => {
    if (hasPlacedBet && !hasCollected) {
      setGain("❌ Pari perdu !");
      setHasPlacedBet(false);
      setBetAmount("");
    }

    setParieurs(generateParieurs());
    setMultiplier(1);
    setTargetCrash(generateBiasedCrash());
    setHasExploded(false);
    setShowColors(false);
    setShowBetWindow(false);
    setCountdown(10);
    setError(null);
    setHasCollected(false);

    if (rocketRef.current) {
      rocketRef.current.style.left = "0%";
      rocketRef.current.style.bottom = "2%";
    }

    refreshWallet(); // ✅ Rafraîchir après chaque nouvelle partie
  };

  const canCashOut = hasPlacedBet && !hasCollected && !hasExploded;

  const bet = parseFloat(betAmount);
  const isBetValid = !isNaN(bet) && bet >= 250 && bet <= walletAmount;

  return (
    <div className="crash-container">
      {/* Affichage principal */}
      <div
        className="crash-display"
        style={{ position: "relative", height: "150px" }}
      >
        <div
          className="multiplier"
          style={{
            whiteSpace: "nowrap",
            fontSize: "2.2rem",
            fontWeight: "bold",
            color:
              multiplier < 2 ? "green" : multiplier < 4 ? "goldenrod" : "red",
            transition: "color 0.3s ease-in-out",
          }}
        >
          {hasExploded
            ? `💥  ${targetCrash.toFixed(2)}x`
            : `${multiplier.toFixed(2)}x`}
          {multiplier >= 10 && !hasExploded && <span> 🔥</span>}
        </div>

        <div
          className={`rocket ${hasExploded ? "explode" : ""}`}
          ref={rocketRef}
          style={{
            position: "absolute",
            zIndex: 2,
            left: "0%",
            bottom: "2%",
            fontSize: "2rem",
          }}
        >
          {hasExploded ? "💥" : "🚀"}
        </div>
      </div>

      {/* Formulaire de pari */}
      <form
        onSubmit={handleBetSubmit}
        style={{
          textAlign: "center",
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          gap: "0.7rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <input
          type="number"
          placeholder="Montant du pari"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          min="250"
          step="0.01"
          disabled={hasPlacedBet && !hasCollected}
          style={{
            padding: "10px",
            fontSize: "16px",
            borderRadius: "8px",
            width: "100px",
            minWidth: "80px",
            flexGrow: 1,
            boxSizing: "border-box",
          }}
        />
        <button
          type="submit"
          disabled={hasPlacedBet || !showBetWindow || !isBetValid}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            fontSize: "16px",
            borderRadius: "8px",
            backgroundColor:
              hasPlacedBet || !showBetWindow || !isBetValid
                ? "#ccc"
                : "#2196F3",
            color: "white",
            cursor:
              hasPlacedBet || !showBetWindow || !isBetValid
                ? "not-allowed"
                : "pointer",
            flexShrink: 0,
          }}
        >
          Parier
        </button>

        {canCashOut && (
          <button
            onClick={handleCollectGain}
            type="button"
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "8px",
              backgroundColor: "orange",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              border: "none",
              marginTop: 10,
              flexShrink: 0,
            }}
          >
            Cash Out
          </button>
        )}
      </form>

      {/* Compte à rebours */}
      {showBetWindow && (
        <div
          className="countdown-message"
          style={{ marginTop: 15, fontWeight: "bold" }}
        >
          ⏳ Le jeu redémarre dans {countdown} seconde{countdown > 1 ? "s" : ""}
          ...
        </div>
      )}

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
      {gain && (
        <div style={{ color: "green", marginTop: 10, fontWeight: "bold" }}>
          {gain}
        </div>
      )}

      <ParieursList
        parieurs={parieurs}
        multiplier={multiplier}
        hasExploded={hasExploded && showColors}
      />
    </div>
  );
};

export default CrashOrCash;
