// src/App.js - Fixed version with LichessProvider added
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { TokenProvider } from './features/token/contexts/TokenContext';
import { SelectedTokenProvider } from './features/token/contexts/SelectedTokenContext';
import { LichessProvider } from './features/auth/contexts/LichessContext';
import { ApiErrorProvider } from './features/common/contexts/ApiErrorContext';
import { NotificationsProvider } from './features/notifications/contexts/NotificationsContext';
import { SocketProvider } from './features/common/contexts/SocketContext';
import { SeasonProvider } from './features/seasons/contexts/SeasonContext';
import { ProfileProvider } from './features/profile/contexts/ProfileContext';

// Layout components
import Layout from './features/layout/components/Layout';

// Page components
import Landing from './features/landing/pages/Landing';
import Home from './features/home/pages/Home';
import Lobby from './features/lobby/pages/Lobby';
import Leaderboard from './features/leaderboard/pages/Leaderboard';
import Store from './features/store/pages/Store';
import Profile from './features/profile/pages/index';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import Notifications from './features/notifications/components/Notifications';

// Auth components
import UserLogin from './features/auth/components/UserLogin';
import AdminLogin from './features/auth/components/AdminLogin';
import Register from './features/auth/components/Register';
import LichessCallback from './features/auth/components/LichessCallback';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

// Info pages
import About from './features/info/pages/About';
import Privacy from './features/info/pages/Privacy';
import Rules from './features/info/pages/Rules';
import Blog from './features/info/pages/Blog';
import Careers from './features/info/pages/Careers';
import InfoLayout from './features/info/layout/InfoLayout';

function App() {
  const location = useLocation();

  return (
    <ApiErrorProvider>
      <AuthProvider>
        <SocketProvider>
          <TokenProvider>
            <SelectedTokenProvider>
              <LichessProvider>
                <NotificationsProvider>
                  <SeasonProvider>
                    <ProfileProvider>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<UserLogin />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/lichess/callback" element={<LichessCallback />} />
                        
                        {/* Info pages */}
                        <Route path="/" element={<InfoLayout />}>
                          <Route path="/about" element={<About />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/rules" element={<Rules />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="/careers" element={<Careers />} />
                        </Route>
                        
                        {/* Protected routes - Standard user */}
                        <Route path="/" element={
                          <ProtectedRoute>
                            <Layout />
                          </ProtectedRoute>
                        }>
                          <Route path="/home" element={<Home />} />
                          <Route path="/lobby" element={<Lobby />} />
                          <Route path="/leaderboards" element={<Leaderboard />} />
                          <Route path="/store" element={<Store />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/notifications" element={<Notifications />} />
                        </Route>
                        
                        {/* Protected routes - Admin user */}
                        <Route path="/admin/dashboard" element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                          </ProtectedRoute>
                        } />
                      </Routes>
                    </ProfileProvider>
                  </SeasonProvider>
                </NotificationsProvider>
              </LichessProvider>
            </SelectedTokenProvider>
          </TokenProvider>
        </SocketProvider>
      </AuthProvider>
    </ApiErrorProvider>
  );
}

export default App;
