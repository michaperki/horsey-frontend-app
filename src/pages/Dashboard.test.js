// src/pages/Dashboard.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import * as AuthContextModule from '../contexts/AuthContext'; // Import entire module
import * as api from '../services/api';

// Mock the API functions
jest.mock('../services/api', () => ({
  initiateLichessOAuth: jest.fn(),
  getUserProfile: jest.fn(),
  disconnectLichess: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Dashboard Component', () => {
  const mockedUseAuth = AuthContextModule.useAuth;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    api.initiateLichessOAuth.mockClear();
    api.getUserProfile.mockClear();
    api.disconnectLichess.mockClear();
    mockedUseAuth.mockClear();
  });

  test('renders LichessConnect button when not connected', async () => {
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    api.getUserProfile.mockResolvedValue({ lichessUsername: null });

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for loading to finish
    expect(await screen.findByText(/Connect Your Lichess Account/i)).toBeInTheDocument();
  });

  test('redirects to /auth/lichess when Connect button is clicked', async () => {
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    api.getUserProfile.mockResolvedValue({ lichessUsername: null });

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Wait for loading to finish
    const button = await screen.findByText(/Connect Your Lichess Account/i);
    fireEvent.click(button);

    expect(api.initiateLichessOAuth).toHaveBeenCalledWith('fake-token');
  });
});
