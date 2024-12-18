// frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Auth/Login";
import AdminLogin from "./components/Auth/AdminLogin";
import Mint from "./components/Admin/Mint";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
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
      </Routes>
    </Router>
  );
}

export default App;
