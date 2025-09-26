import React, { useState, useEffect } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { app } from "./firebase";
import "./Register.css";

const RegisterLogin = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();

  const [mode, setMode] = useState("register");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [promo, setPromo] = useState("");
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setNom("");
    setEmail("");
    setPassword("");
    setPromo("");
  };

  useEffect(() => {
    if (message !== "") {
      const timer = setTimeout(() => setMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !password || (mode === "register" && !nom)) {
      return setMessage("❌ Tous les champs sont requis.");
    }

    try {
      if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await updateProfile(userCredential.user, { displayName: nom });

        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          nom,
          email,
          codePromo: promo,
          createdAt: new Date(),
        });

        setMessage("🎉 Compte créé avec succès !");
        resetForm();
        navigate("/crash-or-cash");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("✅ Connexion réussie !");
        resetForm();
        navigate("/crash-or-cash");
      }
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <div className="register-container">
      <div className="svg-illustration">
        <img
          src="/images/Capture d’écran 2025-06-30 024948.png"
          alt="Illustration"
        />
      </div>

      <form onSubmit={handleSubmit} className="register-form">
        <h2>{mode === "register" ? "Créer un compte" : "Connexion"}</h2>

        {mode === "register" && (
          <>
            <input
              type="text"
              placeholder="Nom complet"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Code promo (optionnel)"
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
            />
          </>
        )}

        <input
          type="email"
          placeholder="Adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <button type="submit">
          {mode === "register" ? "S'inscrire" : "Se connecter"}
        </button>

        {message && <p className="message">{message}</p>}

        <p
          style={{
            paddingTop: "24px",
          }}
          className="toggle"
        >
          {mode === "register" ? (
            <>
              Déjà inscrit ?{" "}
              <span
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#184e80ff",
                }}
                onClick={() => setMode("login")}
              >
                Se connecter
              </span>
            </>
          ) : (
            <>
              Pas encore de compte ?{" "}
              <span
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: "#184e80ff",
                }}
                onClick={() => setMode("register")}
              >
                Créer un compte
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default RegisterLogin;
