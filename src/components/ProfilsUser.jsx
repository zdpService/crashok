import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaMoneyBillAlt,
  FaWallet,
  FaHistory,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { app } from "../auth/firebase";
import PopupModal from "./PopupModal";
import { useAuth } from "../context/Context"; // <-- importer le contexte ici
import "./ProfilsUser.css";

const ProfilsUser = ({ onCloseProfile }) => {
  const [userData, setUserData] = useState(null);
  const [activePopup, setActivePopup] = useState(null);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();

  const { walletAmount } = useAuth(); // <-- récupère le solde global depuis le contexte

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            console.log("Aucune donnée utilisateur trouvée.");
          }
        } catch (error) {
          console.error("Erreur récupération données :", error);
        }
      }
    };

    fetchUserData();
  }, [auth, db]);

  const openPopup = (type) => {
    setActivePopup(type);
    if (type === "depot") {
      if (onCloseProfile) onCloseProfile();
      navigate("/recharge");
    } else if (type === "retrait") {
      if (onCloseProfile) onCloseProfile();
      navigate("/retrait");
    }
  };

  const closePopup = () => setActivePopup(null);

  if (!userData) {
    return <div className="profil-container">Chargement du profil...</div>;
  }

  return (
    <div className="profil-container">
      <h2 className="profil-title">
        <FaUser style={{ marginRight: "8px" }} /> Mon Profil
      </h2>

      <div className="profil-section">
        <p>
          <FaUser /> <strong>Nom :</strong> {userData.nom}
        </p>
        <p>
          <FaEnvelope /> <strong>Email :</strong> {userData.email}
        </p>
        <p>
          <FaWallet /> <strong>Solde :</strong>{" "}
          {walletAmount !== undefined
            ? walletAmount.toFixed(2)
            : (userData.solde || 0).toFixed(2)}{" "}
          ₣
        </p>
      </div>

      <div className="profil-buttons">
        <button className="profil-btn" onClick={() => openPopup("depot")}>
          <FaMoneyBillAlt style={{ marginRight: "8px" }} /> Dépôt
        </button>
        <button className="profil-btn" onClick={() => openPopup("retrait")}>
          <FaMoneyBillAlt style={{ marginRight: "8px" }} /> Retrait
        </button>
        <button className="profil-btn" onClick={() => openPopup("historique")}>
          <FaHistory style={{ marginRight: "8px" }} /> Historique des paris
        </button>
        <button className="profil-btn" onClick={() => openPopup("parametres")}>
          <FaCog style={{ marginRight: "8px" }} /> Paramètres
        </button>
        <button
          className="profil-btn danger"
          onClick={() => openPopup("logout")}
        >
          <FaSignOutAlt style={{ marginRight: "8px" }} /> Déconnexion
        </button>
      </div>

      <PopupModal
        isOpen={activePopup === "historique"}
        onClose={closePopup}
        title="Historique"
      >
        Historique des paris ici
      </PopupModal>
      <PopupModal
        isOpen={activePopup === "parametres"}
        onClose={closePopup}
        title="Paramètres"
      >
        Modifier mes infos ici
      </PopupModal>
      <PopupModal
        isOpen={activePopup === "logout"}
        onClose={closePopup}
        title="Déconnexion"
      >
        Voulez-vous vraiment vous déconnecter ?
        <br />
        <button
          className="close-btn"
          onClick={() => {
            auth.signOut();
            closePopup();
            window.location.href = "/login";
          }}
          style={{ backgroundColor: "#555", marginTop: "10px" }}
        >
          Oui, me déconnecter
        </button>
      </PopupModal>
    </div>
  );
};

export default ProfilsUser;
