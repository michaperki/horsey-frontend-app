
// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Auth/Login";
import AdminLogin from "./components/Auth/AdminLogin";
import Mint from "./components/Admin/Mint";
import Balance from "./components/Admin/Balance";
import Transfer from "./components/Admin/Transfer";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/mint"
          element={
            <ProtectedRoute>
              <Mint />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/balance"
          element={
            <ProtectedRoute>
              <Balance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transfer"
          element={
            <ProtectedRoute>
              <Transfer />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

