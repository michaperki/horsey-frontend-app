
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import PropTypes from 'prop-types';

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
      return requiredRole === 'admin' ? (
        <Navigate to="/admin/login" replace />
      ) : (
        <Navigate to="/" replace />
      );
    }

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

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.string,
};

export default ProtectedRoute;

