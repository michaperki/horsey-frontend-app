// src/components/Navbar.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';

// Mock AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Navbar', () => {
  it('renders the basic links for unauthenticated users', () => {
    useAuth.mockReturnValue({ token: null, user: null, logout: jest.fn() });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/user login/i)).toBeInTheDocument();
    expect(screen.getByText(/register/i)).toBeInTheDocument();
    expect(screen.getByText(/admin login/i)).toBeInTheDocument();
  });

  it('renders user links when a user is logged in', () => {
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user' },
      logout: jest.fn(),
    });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/available bets/i)).toBeInTheDocument();
    expect(screen.getByText(/profile/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it('renders admin links when an admin is logged in', () => {
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'admin' },
      logout: jest.fn(),
    });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/logout/i)).toBeInTheDocument();
  });

  it('calls logout when the logout button is clicked', () => {
    const mockLogout = jest.fn();
    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user' },
      logout: mockLogout,
    });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders the Lichess connection status correctly', async () => {
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ connected: true }),
      })
    );

    useAuth.mockReturnValue({
      token: 'mockToken',
      user: { role: 'user' },
      logout: jest.fn(),
    });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    expect(await screen.findByText(/lichess connected/i)).toBeInTheDocument();

    global.fetch.mockRestore();
  });
});
