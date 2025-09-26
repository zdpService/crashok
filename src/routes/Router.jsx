// Router.js
import React from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import GamesDashoard from "../components/GamesDashoard";
import CrashOrCash from "../components/CrashOrCash";
import Header from "../components/Header";
import RegisterLogin from "../auth/Register";
import ProtectedRoute from "./ProtectedRoute";
import HeaderAuth from "../auth/HeaderAuth";
import Recharge from "../components/Recharge";
import PaiementEchec from "../components/echecs or trues/PaiementEchec";
import PaiementSucces from "../components/echecs or trues/PaiementSucces";
import Retrait from "../components/Retrait";
import TransactionForm from "../components/fireBase/TransactionForm";
import { useAuth } from "../context/Context"; // ✅ Importer le contexte
import UsersList from "../usersList/UserList";
import RechargesList from "../usersList/RechargesList";

const RouterContent = () => {
  const location = useLocation();
  const { walletAmount, setWalletAmount } = useAuth(); // ✅ Utiliser le contexte

  const isLoginRoute = location.pathname === "/login";

  return (
    <>
      {isLoginRoute ? <HeaderAuth /> : <Header walletAmount={walletAmount} />}

      <Routes>
        <Route path="/recharge" element={<Recharge />} />
        <Route path="/retrait" element={<Retrait />} />
        <Route path="/succes" element={<PaiementSucces />} />
        <Route path="/annule" element={<PaiementEchec />} />
        <Route path="/call" element={<TransactionForm />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <GamesDashoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/utilisateur-taches"
          element={
            <ProtectedRoute>
              <UsersList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/utilisateur-recharges"
          element={
            <ProtectedRoute>
              <RechargesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crash-or-cash"
          element={
            <ProtectedRoute>
              <CrashOrCash
                walletAmount={walletAmount}
                setWalletAmount={setWalletAmount}
              />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<RegisterLogin />} />
      </Routes>
    </>
  );
};

const Router = () => (
  <BrowserRouter>
    <RouterContent />
  </BrowserRouter>
);

export default Router;
