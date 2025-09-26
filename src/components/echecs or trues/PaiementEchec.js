import React from "react";
import { Link } from "react-router-dom";

const PaiementEchec = () => {
  return (
    <div style={styles.container}>
      <h2 style={{ color: "#f44336" }}>Paiement échoué ❌</h2>
      <p>La transaction a été annulée ou n’a pas pu être effectuée.</p>
      <p>Veuillez réessayer ou utiliser un autre moyen de paiement.</p>

      <Link to="/recharge" style={styles.link}>
        Retour à la page de recharge
      </Link>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 400,
    margin: "5rem auto",
    padding: "2rem",
    borderRadius: 20,
    backgroundColor: "#fdecea",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    textAlign: "center",
    color: "#333",
  },
  link: {
    display: "inline-block",
    marginTop: "1rem",
    color: "#f44336",
    textDecoration: "none",
  },
};

export default PaiementEchec;
