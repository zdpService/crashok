// src/context/Context.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getFirestore,
} from "firebase/firestore";
import { app } from "../auth/firebase";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [currentUser, setCurrentUser] = useState(null);
  const [walletAmount, setWalletAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ✅ Récupérer le solde depuis Firestore
  const fetchWalletAmount = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, { walletAmount: 0 });
        setWalletAmount(0);
        return 0;
      }

      const data = userSnap.data();
      const amount = data.walletAmount ?? 0;
      if (data.walletAmount === undefined) {
        await updateDoc(userRef, { walletAmount: 0 });
      }
      setWalletAmount(amount);
      return amount;
    } catch (error) {
      console.error("❌ Erreur fetchWalletAmount:", error);
      return 0;
    }
  };

  // ✅ Mettre à jour le solde exact
  const updateWalletInFirestore = async (uid, newAmount) => {
    if (!uid || isNaN(newAmount)) return null;
    try {
      setUpdating(true);
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, { walletAmount: newAmount });
      setWalletAmount(newAmount);
      return newAmount;
    } catch (error) {
      console.error("❌ Erreur updateWalletInFirestore:", error);
      return null;
    } finally {
      setUpdating(false);
    }
  };

  // ✅ Créditer le portefeuille (ajouter un montant)
  const creditWallet = async (amount) => {
    if (!currentUser || amount <= 0) return null;
    const current = await fetchWalletAmount(currentUser.uid);
    const newAmount = current + amount;
    return await updateWalletInFirestore(currentUser.uid, newAmount);
  };

  // ✅ Recharger le solde via FusionPay
  const rechargeWallet = async (amount) => {
    if (!currentUser || amount <= 0) return null;

    try {
      const res = await axios.post(
        "https://crash-backend-lkmn.onrender.com/api/paiement/fusion-recharge",
        {
          montant: amount,
          uid: currentUser.uid,
          nom: currentUser.displayName || "Client",
          email: currentUser.email,
          numeroSend: "01010101",
        }
      );

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        console.error("❌ Impossible de créer le paiement", res.data);
      }
    } catch (error) {
      console.error("❌ Erreur rechargeWallet:", error);
    }
  };

  // ✅ Forcer un refresh du solde
  const refreshWalletAmount = async () => {
    if (!currentUser) return;
    await fetchWalletAmount(currentUser.uid);
  };

  // ✅ Écoute l'état utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchWalletAmount(user.uid);
      } else {
        setWalletAmount(0);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        walletAmount,
        setWalletAmount,
        loading,
        updating,
        updateWalletInFirestore,
        creditWallet,
        rechargeWallet,
        refreshWalletAmount,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
