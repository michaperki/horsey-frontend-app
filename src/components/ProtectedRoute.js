// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect based on required role
    return requiredRole === 'admin' ? <Navigate to="/admin/login" replace /> : <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (requiredRole && decoded.role !== requiredRole) {
      // If the route requires a specific role and user doesn't have it
      return <Navigate to="/" replace />;
    }

    // Optionally, check token expiration here

    return children;
  } catch (error) {
    console.error('Token decoding error:', error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
