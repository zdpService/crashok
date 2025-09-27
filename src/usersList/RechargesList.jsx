import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../auth/firebase";

const RetraitsList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRetraits, setUserRetraits] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "users");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRetraits = async (userId) => {
    try {
      const ref = collection(db, "retraits");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((r) => r.userId === userId);
      setUserRetraits(data);
    } catch (error) {
      console.error("Erreur retraits :", error);
      setMessage("Erreur lors du chargement des retraits.");
    }
  };

  const handleChangeStatus = async (retraitId, newStatus) => {
    try {
      const retraitRef = doc(db, "retraits", retraitId);
      await updateDoc(retraitRef, { status: newStatus });
      setMessage("Statut modifié avec succès.");
      fetchUserRetraits(selectedUser.id);
    } catch (error) {
      console.error("Erreur modification statut :", error);
      setMessage("Erreur lors de la modification du statut.");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter(
      (u) =>
        (u.nom && u.nom.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Chargement...</p>;

  return (
    <div
      style={{
        marginTop: "50px",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ color: "#1976d2" }}>
        📊 Gestion des Utilisateurs & Retraits
      </h2>
      {message && (
        <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
      )}

      {/* 🔍 Champ de recherche */}
      <input
        type="text"
        placeholder="🔍 Rechercher un utilisateur..."
        value={searchQuery}
        onChange={handleSearch}
        style={{
          padding: "8px",
          width: "100%",
          maxWidth: "400px",
          marginBottom: "20px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          fontSize: "14px",
        }}
      />

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ backgroundColor: "#1976d2", color: "#fff" }}>
          <tr>
            <th style={{ padding: "10px" }}>Nom</th>
            <th>Email</th>
            <th>Solde</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u) => (
            <tr
              key={u.id}
              style={{ borderBottom: "1px solid #ccc", color: "#f1f1ff" }}
            >
              <td style={{ padding: "10px" }}>{u.nom || "N/A"}</td>
              <td>{u.email || "N/A"}</td>
              <td>{u.walletAmount || 0} FCFA</td>
              <td>
                <button
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedUser(u);
                    fetchUserRetraits(u.id);
                  }}
                >
                  Voir Retraits
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "700px",
              maxHeight: "80%",
              overflowY: "auto",
              boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>
              📄 {selectedUser.nom} - Solde actuel: {selectedUser.walletAmount}{" "}
              FCFA
            </h3>

            <h4 style={{ color: "#1976d2" }}>Retraits</h4>
            {userRetraits.length === 0 ? (
              <p>Aucun retrait trouvé.</p>
            ) : (
              <table
                style={{
                  width: "100%",
                  marginTop: "10px",
                  borderCollapse: "collapse",
                  fontSize: "14px",
                }}
              >
                <thead style={{ backgroundColor: "#f2f2f2" }}>
                  <tr>
                    <th style={{ padding: "8px" }}>Montant</th>
                    <th>Méthode</th>
                    <th>Date</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {userRetraits.map((r) => (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: "1px solid #ccc",
                        transition: "background 0.3s",
                      }}
                    >
                      <td style={{ padding: "8px" }}>{r.amount} FCFA</td>
                      <td>{r.method}</td>
                      <td>
                        {new Date(r.date.seconds * 1000).toLocaleString()}
                      </td>
                      <td>
                        <select
                          value={r.status}
                          onChange={(e) =>
                            handleChangeStatus(r.id, e.target.value)
                          }
                          style={{
                            padding: "5px",
                            borderRadius: "5px",
                            border: "1px solid #ccc",
                            fontWeight: "bold",
                          }}
                        >
                          <option value="en cours">En cours</option>
                          <option value="terminé">Terminé</option>
                          <option value="annulé">Annulé</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              style={{
                marginTop: "15px",
                backgroundColor: "#F44336",
                color: "#fff",
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setSelectedUser(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetraitsList;
