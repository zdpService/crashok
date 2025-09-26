// PopupModal.js
import React from "react";
import "./PopupModal.css";

const PopupModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-modal">
        <h3>{title}</h3>
        <div className="popup-content">{children}</div>
        <button className="close-btn" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default PopupModal;
