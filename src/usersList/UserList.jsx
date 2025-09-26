// src/components/UsersList.jsx
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newAmount, setNewAmount] = useState("");
  const [message, setMessage] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

  // ✅ Vérifie si l'utilisateur courant est admin
  const checkAdmin = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const data = userSnap.data();
      return data?.admin === true;
    } catch (error) {
      console.error("Erreur vérification admin :", error);
      return false;
    }
  };

  // ✅ Charger tous les utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      setMessage(usersData.length === 0 ? "Aucun utilisateur trouvé." : null);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
      setMessage("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Supprimer un utilisateur
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await deleteDoc(doc(db, "users", id));
        setMessage("Utilisateur supprimé avec succès !");
        fetchUsers();
      } catch (error) {
        console.error("Erreur suppression :", error);
        setMessage("Erreur lors de la suppression !");
      }
    }
  };

  // ✅ Modifier le solde (ancien solde + montant demandé)
  const handleUpdateBalance = async () => {
    if (!newAmount || isNaN(newAmount)) {
      alert("Veuillez entrer un montant valide !");
      return;
    }

    try {
      const currentBalance = editingUser.walletAmount || 0;
      const amountToAdd = parseFloat(newAmount);
      const updatedBalance = currentBalance + amountToAdd;

      await updateDoc(doc(db, "users", editingUser.id), {
        walletAmount: updatedBalance,
      });

      setMessage(
        `Solde mis à jour pour ${editingUser.nom} : ${updatedBalance} CFA`
      );
      setEditingUser(null);
      setNewAmount("");
      fetchUsers();
    } catch (error) {
      console.error("Erreur mise à jour :", error);
      setMessage("Erreur lors de la mise à jour du solde !");
    }
  };

  // ✅ Vérification admin et récupération des utilisateurs
  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      if (!user) {
        setMessage("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      try {
        const adminStatus = await checkAdmin(user.uid);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          await fetchUsers();
        } else {
          setMessage("Vous n'êtes pas admin.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Erreur lors de la vérification admin.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ✅ Filtrer les utilisateurs
  const filteredUsers = users.filter(
    (user) =>
      user.nom?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 50 }}>Chargement...</p>;
  if (!isAdmin)
    return <p style={{ textAlign: "center", marginTop: 50 }}>{message}</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Gestion des Utilisateurs
      </h2>

      <input
        type="text"
        placeholder="Rechercher par nom ou email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 20,
          borderRadius: 5,
          border: "1px solid #ccc",
        }}
      />

      {message && (
        <p style={{ textAlign: "center", color: "red", marginBottom: 15 }}>
          {message}
        </p>
      )}

      {filteredUsers.length === 0 ? (
        <p style={{ textAlign: "center" }}>Aucun utilisateur trouvé.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            borderRadius: 8,
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#2196F3", color: "white" }}>
              <th style={{ padding: 10 }}>Nom</th>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>Solde</th>
              <th style={{ padding: 10 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: 10 }}>{user.nom || "N/A"}</td>
                <td style={{ padding: 10 }}>{user.email || "N/A"}</td>
                <td style={{ padding: 10, fontWeight: "bold" }}>
                  {user.walletAmount || 0}
                </td>
                <td style={{ padding: 10 }}>
                  <button
                    onClick={() => setEditingUser(user)}
                    style={{
                      marginRight: 10,
                      padding: "5px 10px",
                      backgroundColor: "#FFC107",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#F44336",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editingUser && (
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
            zIndex: 999,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: 400,
            }}
          >
            <h3>Ajouter un montant à {editingUser.nom}</h3>
            <p>
              Solde actuel :{" "}
              <strong>{editingUser.walletAmount || 0} CFA</strong>
            </p>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              placeholder="Montant à ajouter"
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 10,
                borderRadius: 5,
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleUpdateBalance}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: 10,
                border: "none",
                borderRadius: 5,
                marginRight: 10,
                cursor: "pointer",
              }}
            >
              Valider
            </button>
            <button
              onClick={() => setEditingUser(null)}
              style={{
                backgroundColor: "#F44336",
                color: "white",
                padding: 10,
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
