import React, { useState } from "react";
import "./Modal.css";

const ModalRetrait = ({ onClose, onRetrait, solde }) => {
  const [montant, setMontant] = useState("");

  const handleRetrait = () => {
    const value = parseFloat(montant);
    if (!isNaN(value) && value > 0 && value <= solde) {
      onRetrait(value);
      onClose();
    } else {
      alert("Montant invalide ou insuffisant.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Retrait de fonds</h3>
        <input
          type="number"
          placeholder="Montant à retirer"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleRetrait}>Valider</button>
          <button className="cancel" onClick={onClose}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRetrait;
