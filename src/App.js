// src/App.js - Fixed provider order to resolve dependency errors

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/contexts/AuthContext';
import { LichessProvider } from './features/auth/contexts/LichessContext';
import { NotificationsProvider } from './features/notifications/contexts/NotificationsContext';
import { TokenProvider } from './features/token/contexts/TokenContext';
import { SelectedTokenProvider } from './features/token/contexts/SelectedTokenContext';
import { ApiErrorProvider } from './features/common/contexts/ApiErrorContext';
import { SocketProvider } from './features/common/contexts/SocketContext';
import { ProfileProvider } from './features/profile/contexts/ProfileContext';
import ErrorBoundary from './features/common/components/ErrorBoundary';

// Import all your route components
import Landing from './features/landing/pages/Landing';
import Home from './features/home/pages/Home';
import UserLogin from './features/auth/components/UserLogin';
import Register from './features/auth/components/Register';
import AdminLogin from './features/auth/components/AdminLogin';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import Lobby from './features/lobby/pages/Lobby';
import Leaderboard from './features/leaderboard/pages/Leaderboard';
import Profile from './features/profile/pages/index';
import LichessCallback from './features/auth/components/LichessCallback';
import Store from './features/store/pages/Store';
import Notifications from './features/notifications/components/Notifications';
import About from './features/info/pages/About';
import Rules from './features/info/pages/Rules';
import Blog from './features/info/pages/Blog';
import Careers from './features/info/pages/Careers';
import Privacy from './features/info/pages/Privacy';
import Layout from './features/layout/components/Layout';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import NotificationsModal from './features/notifications/components/NotificationsModal';

function App() {
  return (
    <ErrorBoundary>
        {/* 
          Order matters! ApiErrorProvider needs to be before any component that uses useApiError
          The correct nesting order should be:
          1. Router (for navigation)
          2. ApiErrorProvider (needed by many other contexts)
          3. AuthProvider (needed for user info)
          4. SocketProvider (needs auth)
          5. Other feature-specific providers
        */}
        <ApiErrorProvider>
          <AuthProvider>
            <SocketProvider>
              <TokenProvider>
                <SelectedTokenProvider>
                  <LichessProvider>
                    <NotificationsProvider>
                      <ProfileProvider>
                        <Routes>
                          {/* Public routes */}
                          <Route path="/" element={<Landing />} />
                          <Route path="/login" element={<UserLogin />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/admin/login" element={<AdminLogin />} />
                          <Route path="/lichess/callback" element={<LichessCallback />} />
                          
                          {/* Info pages */}
                          <Route path="/about" element={<About />} />
                          <Route path="/rules" element={<Rules />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="/careers" element={<Careers />} />
                          <Route path="/privacy" element={<Privacy />} />
                          
                          {/* Protected routes with Layout */}
                          <Route path="/" element={
                            <ProtectedRoute>
                              <Layout />
                            </ProtectedRoute>
                          }>
                            <Route path="home" element={<Home />} />
                            <Route path="lobby" element={<Lobby />} />
                            <Route path="leaderboards" element={<Leaderboard />} />
                            <Route path="profile" element={<Profile />} />
                            <Route path="store" element={<Store />} />
                            <Route path="notifications" element={<Notifications />} />
                          </Route>
                          
                          {/* Admin routes */}
                          <Route path="/admin/dashboard" element={
                            <ProtectedRoute requiredRole="admin">
                              <AdminDashboard />
                            </ProtectedRoute>
                          } />
                          
                          {/* 404 route */}
                          <Route path="*" element={<div>Page not found</div>} />
                        </Routes>
                        
                        {/* Global components */}
                        <NotificationsModal />
                      </ProfileProvider>
                    </NotificationsProvider>
                  </LichessProvider>
                </SelectedTokenProvider>
              </TokenProvider>
            </SocketProvider>
          </AuthProvider>
        </ApiErrorProvider>
    </ErrorBoundary>
  );
}

export default App;
