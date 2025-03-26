
// src/test-utils.js

import React from 'react';
import PropTypes from 'prop-types';
import { render as rtlRender } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { TokenProvider } from '../contexts/TokenContext';
import { SelectedTokenProvider } from '../contexts/SelectedTokenContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { LichessProvider } from '../contexts/LichessContext';
import { BrowserRouter as Router } from 'react-router-dom';

// This component wraps children with all necessary providers
const AllProviders = ({ children }) => {
  return (
    <Router>
      <AuthProvider>
        <TokenProvider>
          <SelectedTokenProvider>
            <LichessProvider>
              <NotificationsProvider>
                {children}
              </NotificationsProvider>
            </LichessProvider>
          </SelectedTokenProvider>
        </TokenProvider>
      </AuthProvider>
    </Router>
  );
};

// Define propTypes for AllProviders
AllProviders.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom render function that includes all providers
const customRender = (ui, options) =>
  rtlRender(ui, { wrapper: AllProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Override the render method
export { customRender as render };
