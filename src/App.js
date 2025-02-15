
// src/App.js

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
import ProfilePage from './pages/Profile';
import RulesPage from './pages/Info/Rules';
import AboutPage from './pages/Info/About';
import CareersPage from './pages/Info/Careers';
import BlogPage from './pages/Info/Blog';
import PrivacyPage from './pages/Info/Privacy';
import Notifications from './components/Notifications';
import LichessCallback from './components/Auth/LichessCallback';
import Layout from './components/Layout';
import { SocketProvider } from './contexts/SocketContext';
import { TokenProvider } from './contexts/TokenContext';
import { SelectedTokenProvider } from './contexts/SelectedTokenContext';
import { LichessProvider } from './contexts/LichessContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import NotificationsModal from './components/NotificationsModal';
import Store from './pages/Store';

function App() {
  return (
    <SocketProvider>
      <TokenProvider>
        <SelectedTokenProvider>
          <LichessProvider>
            <ProfileProvider>
              <NotificationsProvider>
                <NotificationsModal />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<UserLogin />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/auth/lichess/callback" element={<LichessCallback />} />

                  <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/lobby" element={<Lobby />} />
                    <Route path="/leaderboards" element={<Leaderboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/store" element={<Store />} />
                  </Route>

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
                  <Route path="/place-bet" element={<PlaceBet isOpen={true} onClose={() => {}} />} />
                  <Route path="/rules" element={<RulesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/careers" element={<CareersPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
              </NotificationsProvider>
            </ProfileProvider>
          </LichessProvider>
        </SelectedTokenProvider>
      </TokenProvider>
    </SocketProvider>
  );
}

export default App;
