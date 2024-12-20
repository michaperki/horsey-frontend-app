
// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return requiredRole === 'admin' ? (
      <Navigate to="/admin/login" replace />
    ) : (
      <Navigate to="/login" replace />
    );
  }

  try {
    const decoded = jwtDecode(token);

    if (requiredRole && decoded.role !== requiredRole) {
      // Redirect to admin login if the required role is admin but the user isn't admin
      return requiredRole === 'admin' ? (
        <Navigate to="/admin/login" replace />
      ) : (
        <Navigate to="/" replace />
      );
    }

    // Check token expiration
    const isTokenExpired = decoded.exp * 1000 < Date.now();
    if (isTokenExpired) {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    console.error('Token decoding error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

