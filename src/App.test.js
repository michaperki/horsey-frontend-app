// src/App.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from 'features/auth/contexts/AuthContext';
import { TokenProvider } from 'features/token/contexts/TokenContext';
import { SelectedTokenProvider } from 'features/token/contexts/SelectedTokenContext';
import { LichessProvider } from 'features/auth/contexts/LichessContext';
import { ProfileProvider } from 'features/profile/contexts/ProfileContext';
import { NotificationsProvider } from 'features/notifications/contexts/NotificationsContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the socket context
jest.mock('features/common/contexts/SocketContext', () => {
  const originalModule = jest.requireActual('./__mocks__/socket-context');
  return originalModule;
});

// Mock Landing component to avoid socket issues
jest.mock('features/landing/pages/Landing', () => {
  return function MockedLanding() {
    return (
      <div data-testid="landing-page">
        <h1>Welcome to Horsey</h1>
        <p>Bet, Play, Win. Join the ultimate chess gaming experience!</p>
      </div>
    );
  };
});

// Create a custom render function that includes all providers
const renderWithProviders = (ui, options = {}) => {
  return render(
    <MemoryRouter {...options.routerProps}>
      <AuthProvider>
        <TokenProvider>
          <SelectedTokenProvider>
            <LichessProvider>
              <ProfileProvider>
                <NotificationsProvider>
                  {ui}
                </NotificationsProvider>
              </ProfileProvider>
            </LichessProvider>
          </SelectedTokenProvider>
        </TokenProvider>
      </AuthProvider>
    </MemoryRouter>,
    options
  );
};

// Mock localStorage.getItem to return null for 'token'
beforeEach(() => {
  Storage.prototype.getItem = jest.fn((key) => {
    return null; // Return null for any key (to simulate no token)
  });
});

test('renders landing page when not logged in', () => {
  renderWithProviders(<App />);
  
  // Check for elements that should be present on the landing page
  const welcomeElement = screen.getByText(/Welcome to Horsey/i);
  expect(welcomeElement).toBeInTheDocument();
});

// You can add more tests as needed
// For example, to test authenticated routes, you could mock localStorage to return a token
// and use different initialEntries in MemoryRouter