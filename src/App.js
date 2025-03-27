// src/App.js

import React from "react";
import { Routes, Route } from "react-router-dom";

// Feature imports
import Landing from "./features/landing/pages/Landing";
import Home from './features/home/pages/Home';
import Lobby from './features/lobby/pages/Lobby';
import Leaderboard from './features/leaderboard/pages/Leaderboard';
import Store from './features/store/pages/Store';
import Profile from './features/profile/pages';

// Auth feature
import Register from './features/auth/components/Register';
import UserLogin from './features/auth/components/UserLogin';
import AdminLogin from './features/auth/components/AdminLogin';
import LichessCallback from './features/auth/components/LichessCallback';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { LichessProvider } from './features/auth/contexts/LichessContext';

// Admin feature
import AdminDashboard from './features/admin/pages/AdminDashboard';

// Betting feature
import PlaceBet from "./features/betting/components/PlaceBet";

// Info feature
import RulesPage from './features/info/pages/Rules';
import AboutPage from './features/info/pages/About';
import CareersPage from './features/info/pages/Careers';
import BlogPage from './features/info/pages/Blog';
import PrivacyPage from './features/info/pages/Privacy';

// Notifications feature
import Notifications from './features/notifications/components/Notifications';
import NotificationsModal from './features/notifications/components/NotificationsModal';
import { NotificationsProvider } from './features/notifications/contexts/NotificationsContext';

// Layout feature
import Layout from './features/layout/components/Layout';
import InfoLayout from './features/info/layout/InfoLayout';

// Common/Shared contexts
import { SocketProvider } from './features/common/contexts/SocketContext';
import { TokenProvider } from './features/token/contexts/TokenContext';
import { SelectedTokenProvider } from './features/token/contexts/SelectedTokenContext';
import { ProfileProvider } from './features/profile/contexts/ProfileContext';

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
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/store" element={<Store />} />
                  </Route>

                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/place-bet" element={<PlaceBet isOpen={true} onClose={() => {}} />} />
                  <Route element={<InfoLayout />}>
                    <Route path="/rules" element={<RulesPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                  </Route>
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