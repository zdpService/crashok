import React, { useState } from "react";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import "./SignupForm.css"; // à créer pour le style

const SignupForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(formData); // à connecter à Firebase plus tard
  };

  return (
    <div className="signup-container">
      <svg
        viewBox="0 0 500 150"
        preserveAspectRatio="none"
        className="wave-svg"
      >
        <path d="M0.00,49.98 C150.00,150.00 349.73,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" />
      </svg>

      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Inscription</h2>

        <div className="input-group">
          <FaUser />
          <input
            type="text"
            name="nom"
            placeholder="Nom complet"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <FaEnvelope />
          <input
            type="email"
            name="email"
            placeholder="Adresse Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <FaLock />
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Créer un compte
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
