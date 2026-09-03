import React from "react";
import { Navigate } from "react-router-dom";

// Wrap any protected page with this, e.g.:
// <Route path="/" element={<ProtectedRoute><LandingPage /></ProtectedRoute>} />
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // no session — bounce to login, replacing history so back button can't return here
    return <Navigate to="/login" replace />;
  }

  return children;
}