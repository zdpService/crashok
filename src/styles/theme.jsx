.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  min-height: 100vh;
  padding: 20px;
  background: #0D0D0D; /* fond sombre */
  color: white; /* texte clair */
}

.svg-illustration img {
  width: 280px;
  margin: 20px;
  filter: brightness(0) invert(1); /* si SVG clair, on inverse les couleurs pour qu’il soit visible */
}

.register-form {
  background: #1a1a1a; /* fond très foncé mais pas noir total */
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.1); /* ombre légère claire */
  max-width: 350px;
  width: 100%;
  color: white;
}

.register-form h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #e0f7fa; /* texte clair */
}

.register-form input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #555;
  border-radius: 10px;
  font-size: 16px;
  background-color: #333;
  color: white;
}

.register-form input::placeholder {
  color: #bbb;
}

.register-form button {
  width: 100%;
  padding: 12px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}

.register-form button:hover {
  background: #0d47a1;
}

.message {
  text-align: center;
  margin-top: 15px;
  font-weight: bold;
  color: #76ff03; /* message succès en vert clair */
}
