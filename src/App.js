
// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing"; // Updated import
import Mint from "./components/Admin/Mint";
import Balance from "./components/Admin/Balance";
import Transfer from "./components/Admin/Transfer";
import ValidateResult from "./components/Admin/ValidateResult";
import PlaceBet from "./components/PlaceBet";
import Register from './components/Auth/Register';
import UserLogin from './components/Auth/UserLogin';
import AdminLogin from './components/Auth/AdminLogin';
import Home from './pages/Home'; // Updated import
import AdminDashboard from './pages/AdminDashboard';
import Lobby from './pages/Lobby'; // New import
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import Navbar from './components/Navbar';
import AvailableBets from './components/AvailableBets'; // May no longer be needed directly
import LichessCallback from './components/Auth/LichessCallback';
import { SocketProvider } from './contexts/SocketContext';
import { TokenProvider } from './contexts/TokenContext';
import NotificationsModal from './components/NotificationsModal';

function App() {
  return (
    <SocketProvider>
      <TokenProvider>
        
        <Navbar />
        <NotificationsModal /> {/* Include the modal here */}
        <Routes>
          <Route path="/" element={<Landing />} /> {/* Updated route */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/auth/lichess/callback" element={<LichessCallback />} /> {/* New Route */}
          <Route
            path="/home" // Updated route path
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobby" // New Lobby route
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/place-bet"
            element={
              <ProtectedRoute>
                <PlaceBet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mint"
            element={
              <ProtectedRoute requiredRole="admin">
                <Mint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/balance"
            element={
              <ProtectedRoute requiredRole="admin">
                <Balance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/transfer"
            element={
              <ProtectedRoute requiredRole="admin">
                <Transfer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/validate-result"
            element={
              <ProtectedRoute requiredRole="admin">
                <ValidateResult />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </TokenProvider>
    </SocketProvider>
  );
}

export default App;

