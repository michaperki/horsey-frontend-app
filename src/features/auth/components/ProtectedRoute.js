// src/features/auth/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext';
import { ApiError } from '../../common/components/ApiError';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user } = useAuth();

  try {
    if (!token) {
      return requiredRole === 'admin'
        ? <Navigate to="/admin/login" replace />
        : <Navigate to="/login" replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
      return requiredRole === 'admin'
        ? <Navigate to="/admin/login" replace />
        : <Navigate to="/" replace />;
    }

    // Check for token expiration (if user.exp exists)
    if (user?.exp && user.exp * 1000 < Date.now()) {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    // Render a fallback UI if an error occurs
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <ApiError error={error} onDismiss={() => window.location.reload()} compact />
      </div>
    );
  }
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedRoute;

