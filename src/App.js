
import React from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Mint from "./components/Admin/Mint";
import Balance from "./components/Admin/Balance";
import Transfer from "./components/Admin/Transfer";
import ValidateResult from "./components/Admin/ValidateResult";
import PlaceBet from "./components/PlaceBet";
import Register from './components/Auth/Register';
import UserLogin from './components/Auth/UserLogin';
import AdminLogin from './components/Auth/AdminLogin';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Lobby from './pages/Lobby';
import Leaderboard from './pages/Leaderboard';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';
import Notifications from './components/Notifications';
import Navbar from './components/Navbar';
import LichessCallback from './components/Auth/LichessCallback';
import Layout from './components/Layout'; // Import Layout
import { SocketProvider } from './contexts/SocketContext';
import { TokenProvider } from './contexts/TokenContext';
import NotificationsModal from './components/NotificationsModal';

function App() {
  return (
    <SocketProvider>
      <TokenProvider>
        <Navbar />
        <NotificationsModal />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
          
          {/* Routes with Layout (Persistent Sidebar) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/home" element={<Home />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/leaderboards" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/place-bet" element={<PlaceBet />} />
          </Route>
          
          {/* Admin Routes */}
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

