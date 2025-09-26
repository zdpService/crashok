import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../auth/firebase";

const RechargesList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRecharges, setUserRecharges] = useState([]);
  const [newAmount, setNewAmount] = useState("");

  // ✅ Charger tous les utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const ref = collection(db, "users");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    } catch (error) {
      console.error("Erreur :", error);
      setMessage("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger les recharges d'un utilisateur
  const fetchUserRecharges = async (userId) => {
    try {
      const ref = collection(db, "recharges");
      const snapshot = await getDocs(ref);
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((r) => r.userId === userId);
      setUserRecharges(data);
    } catch (error) {
      console.error("Erreur recharges :", error);
      setMessage("Erreur lors du chargement des recharges.");
    }
  };

  // ✅ Valider une recharge
  const handleValidate = async (recharge) => {
    try {
      const userRef = doc(db, "users", recharge.userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentBalance = userSnap.data().walletAmount || 0;
        const newBalance = currentBalance + recharge.montant;

        await updateDoc(userRef, { walletAmount: newBalance });
        const rechargeRef = doc(db, "recharges", recharge.id);
        await updateDoc(rechargeRef, { status: "validated" });

        setMessage(
          `Recharge validée pour ${recharge.nom}. Nouveau solde : ${newBalance} FCFA`
        );
        fetchUserRecharges(recharge.userId);
        fetchUsers();
      } else {
        setMessage("Utilisateur introuvable.");
      }
    } catch (error) {
      console.error("Erreur validation :", error);
      setMessage("Erreur lors de la validation.");
    }
  };

  // ✅ Mettre à jour le solde manuellement
  const handleUpdateBalance = async () => {
    if (!newAmount || isNaN(newAmount)) {
      alert("Veuillez entrer un montant valide !");
      return;
    }
    try {
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, { walletAmount: parseFloat(newAmount) });

      setMessage(`Solde mis à jour pour ${selectedUser.nom} !`);
      fetchUsers();
      setSelectedUser({ ...selectedUser, walletAmount: parseFloat(newAmount) });
      setNewAmount("");
    } catch (error) {
      console.error("Erreur mise à jour :", error);
      setMessage("Erreur lors de la mise à jour du solde !");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Gestion des Utilisateurs & Recharges</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#2196F3", color: "#fff" }}>
            <th>Nom</th>
            <th>Email</th>
            <th>Solde</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td>{u.nom || "N/A"}</td>
              <td>{u.email || "N/A"}</td>
              <td>{u.walletAmount || 0} FCFA</td>
              <td>
                <button
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: 5,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedUser(u);
                    setNewAmount(u.walletAmount || 0);
                    fetchUserRecharges(u.id);
                  }}
                >
                  Voir Recharges
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ✅ Modal Utilisateur + Recharges */}
      {selectedUser && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              color: "#000",
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: "500px",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <h3>
              {selectedUser.nom} - Solde actuel: {selectedUser.walletAmount}{" "}
              FCFA
            </h3>

            <div style={{ marginBottom: 15 }}>
              <input
                type="number"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                style={{ padding: 8, width: "60%", marginRight: 10 }}
              />
              <button
                onClick={handleUpdateBalance}
                style={{
                  backgroundColor: "#007BFF",
                  color: "#fff",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 5,
                  cursor: "pointer",
                }}
              >
                Mettre à jour
              </button>
            </div>

            <h4>Recharges</h4>
            {userRecharges.length === 0 ? (
              <p>Aucune recharge trouvée.</p>
            ) : (
              <table style={{ width: "100%", marginTop: 10 }}>
                <thead>
                  <tr>
                    <th>Montant</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userRecharges.map((r) => (
                    <tr key={r.id}>
                      <td>{r.montant} FCFA</td>
                      <td>{r.status}</td>
                      <td>
                        {r.status === "pending" && (
                          <button
                            style={{
                              backgroundColor: "#4CAF50",
                              color: "#fff",
                              border: "none",
                              padding: "5px 10px",
                              borderRadius: 5,
                              cursor: "pointer",
                            }}
                            onClick={() => handleValidate(r)}
                          >
                            Valider
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              style={{
                marginTop: 10,
                backgroundColor: "#F44336",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 5,
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

export default RechargesList;
