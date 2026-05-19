// src/features/chess/mocks/ContextOverride.js
import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

// Create a context for overriding auth in development mode
const DevModeAuthContext = createContext({
  user: { id: 'dev-player-id', name: 'Developer' },
  token: 'dev-token',
  isAuthenticated: true
});

// A hook that can be used instead of the real useAuth
export const useDevModeAuth = () => useContext(DevModeAuthContext);

// A provider component that supplies a fake auth context
export const DevModeAuthProvider = ({ children }) => {
  const devUser = { 
    id: 'dev-player-id', 
    name: 'Developer',
    username: 'developer',
    email: 'dev@example.com',
    roles: ['user']
  };

  const authContextValue = {
    user: devUser,
    token: 'dev-token',
    isAuthenticated: true,
    loading: false,
    error: null,
    login: () => console.log('[DevMode] Auth login called'),
    register: () => console.log('[DevMode] Auth register called'),
    logout: () => console.log('[DevMode] Auth logout called'),
    clearError: () => console.log('[DevMode] Auth clearError called')
  };

  return (
    <DevModeAuthContext.Provider value={authContextValue}>
      {children}
    </DevModeAuthContext.Provider>
  );
};

DevModeAuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DevModeAuthContext;