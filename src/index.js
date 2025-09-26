// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Router from "./routes/Router";
import { AuthProvider } from "../src/context/Context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <Router />
  </AuthProvider>
);

reportWebVitals();
