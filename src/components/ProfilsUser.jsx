import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaEnvelope,
  FaMoneyBillAlt,
  FaWallet,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaArrowLeft,
} from "react-icons/fa";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { app } from "../auth/firebase";
import PopupModal from "./PopupModal";
import { useAuth } from "../context/Context";
import "./ProfilsUser.css";

const ProfilsUser = ({ onCloseProfile, toggleProfile }) => {
  const [userData, setUserData] = useState(null);
  const [activePopup, setActivePopup] = useState(null);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [retraits, setRetraits] = useState([]);

  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();

  const { walletAmount } = useAuth();

  const generateUserId = () => {
    return Math.floor(100000000 + Math.random() * 900000000);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            if (!data.userId) {
              const newUserId = generateUserId();
              await setDoc(doc(db, "users", currentUser.uid), {
                ...data,
                userId: newUserId,
                telephone: data.telephone || "",
                telephoneModifiable: true,
              });
              setUserData({
                ...data,
                userId: newUserId,
                telephone: data.telephone || "",
                telephoneModifiable: true,
              });
            } else {
              if (data.telephoneModifiable === undefined) {
                await updateDoc(doc(db, "users", currentUser.uid), {
                  telephoneModifiable: true,
                });
                data.telephoneModifiable = true;
              }
              if (!data.telephone) {
                await updateDoc(doc(db, "users", currentUser.uid), {
                  telephone: "",
                });
                data.telephone = "";
              }
              setUserData(data);
            }
          }
        } catch (error) {
          console.error("Erreur récupération données :", error);
        }
      }
    };

    fetchUserData();
  }, [auth, db]);

  const fetchRetraits = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, "retraits"),
        where("userId", "==", auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setRetraits(data);
    } catch (error) {
      console.error("Erreur récupération retraits :", error);
    }
  };

  const openPopup = async (type) => {
    if (type === "historique") {
      await fetchRetraits(); // Récupération des retraits
    }
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

  const savePhone = async () => {
    if (!newPhone.trim()) return;
    const currentUser = auth.currentUser;
    await updateDoc(doc(db, "users", currentUser.uid), {
      telephone: newPhone,
      telephoneModifiable: false,
    });
    setUserData({
      ...userData,
      telephone: newPhone,
      telephoneModifiable: false,
    });
    setEditingPhone(false);
  };

  if (!userData) {
    return <div className="profil-container">Chargement du profil...</div>;
  }

  return (
    <div className="profil-container">
      <button
        className="back-btn-profile"
        onClick={() => {
          if (onCloseProfile) onCloseProfile();
          navigate("/crash-or-cash");
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          fontSize: "16px",
          color: "#1976d2",
        }}
      >
        <FaArrowLeft style={{ marginRight: "5px" }} /> Retour
      </button>

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
        <p>
          <strong>ID Utilisateur :</strong> {userData.userId}
        </p>
        <p>
          <strong>Téléphone :</strong>{" "}
          {!editingPhone ? (
            <>
              {userData.telephone || "N° de retrait"}{" "}
              {userData.telephoneModifiable && (
                <button
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#262626",
                    color: "#ffffff",
                    border: "none",
                    boxShadow: "1px 1px 2px 2px #ffffff",
                    borderRadius: "0px 7px 0px 7px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setEditingPhone(true);
                    setNewPhone(userData.telephone || "");
                  }}
                >
                  Ajouter
                </button>
              )}
            </>
          ) : (
            <div className="modificationNumber">
              <input
                style={{
                  padding: "0.3rem 0.1rem",
                }}
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#262626",
                    color: "#ffffff",
                    border: "none",
                    boxShadow: "1px 1px 2px 2px #ffffff",
                    borderRadius: "0px 7px 0px 7px",
                    cursor: "pointer",
                  }}
                  onClick={savePhone}
                >
                  Enregistrer
                </button>
                <button
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#262626",
                    color: "red",
                    border: "none",
                    boxShadow: "1px 1px 2px 2px #ffffff",
                    borderRadius: "0px 7px 0px 7px",
                    cursor: "pointer",
                  }}
                  onClick={() => setEditingPhone(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
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
          <FaHistory style={{ marginRight: "8px" }} /> Historique des retraits
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

      {/* Modale historique des retraits */}
      <PopupModal
        isOpen={activePopup === "historique"}
        onClose={closePopup}
        title="Historique des retraits"
      >
        {retraits.length === 0 ? (
          <p
            style={{
              textAlign: "center",
              fontSize: "18px",
              color: "#777",
              padding: "20px",
            }}
          >
            Aucun retrait effectué.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "15px",
              padding: "10px",
            }}
          >
            {retraits.map((retrait) => (
              <div
                key={retrait.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "20px",
                  boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
                  borderLeft: `5px solid ${
                    retrait.status === "en cours"
                      ? "#f0ad4e"
                      : retrait.status === "terminé"
                      ? "#28a745"
                      : "#dc3545"
                  }`,
                  transition: "transform 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                <p
                  style={{
                    margin: "0",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  Montant :{" "}
                  <span style={{ color: "#1976d2" }}>{retrait.amount} ₣</span>
                </p>
                <p style={{ margin: "5px 0", color: "#555" }}>
                  Méthode : <strong>{retrait.method}</strong>
                </p>
                <p style={{ margin: "5px 0" }}>
                  Statut :{" "}
                  <span
                    style={{
                      fontWeight: "600",
                      color:
                        retrait.status === "en cours"
                          ? "#f0ad4e"
                          : retrait.status === "terminé"
                          ? "#28a745"
                          : "#dc3545",
                    }}
                  >
                    {retrait.status.toUpperCase()}
                  </span>
                </p>
                <p style={{ margin: "5px 0", fontSize: "14px", color: "#777" }}>
                  Date :{" "}
                  {new Date(retrait.date.seconds * 1000).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
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
