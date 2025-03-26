
// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user } = useAuth(); // Use AuthContext

  if (!token) {
    return requiredRole === 'admin' ? (
      <Navigate to="/admin/login" replace />
    ) : (
      <Navigate to="/login" replace />
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return requiredRole === 'admin' ? (
      <Navigate to="/admin/login" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  const isTokenExpired = user?.exp * 1000 < Date.now();
  if (isTokenExpired) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedRoute;

