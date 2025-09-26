import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const HeaderAuth = () => {
  return (
    <header className="auth-header">
      <div className="auth-header-content">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5HtKvMnz7BBx7yHtSe-Zz4lLYrP_iYBj0PwYsKrrMGSxo0CtSES177bT64yA4gpKg5G8&usqp=CAU" // place ton logo ici
          alt="Crash Or Cash Logo"
          className="auth-logo"
        />
        <Link to="/" className="auth-home-link">
          Retour à l'accueil
        </Link>
      </div>
    </header>
  );
};

export default HeaderAuth;
