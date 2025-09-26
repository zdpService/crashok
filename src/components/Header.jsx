import React, { useState } from "react";
import { FaBars, FaPlus } from "react-icons/fa";
import { useAuth } from "../context/Context";
import ProfilsUser from "./ProfilsUser";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const { currentUser, walletAmount } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const toggleProfile = () => setShowProfile((prev) => !prev);

  const handleReloadWallet = (e) => {
    e.stopPropagation();
    if (currentUser) {
      navigate("/recharge");
    } else {
      alert("Vous devez être connecté pour recharger votre solde.");
    }
  };

  return (
    <>
      <div className="crash-header">
        <div onClick={handleReloadWallet} className="wallet">
          {currentUser ? (
            <>
              <span
                style={{ cursor: "pointer", marginRight: "0.4rem" }}
                title="Recharger le solde"
              >
                <FaPlus />
              </span>
              {walletAmount ? walletAmount.toFixed(2) : "0.00"}
              <span style={{ paddingLeft: "0.4rem" }}>₣</span>
            </>
          ) : (
            "Non connecté"
          )}
        </div>
        <div className="icons">
          <span onClick={toggleProfile} style={{ cursor: "pointer" }}>
            <FaBars />
          </span>
        </div>
      </div>

      {showProfile && (
        <ProfilsUser onCloseProfile={() => setShowProfile(false)} />
      )}
    </>
  );
};

export default Header;
