
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
  beforeEach(() => {
    // Mock global fetch for Lichess connection status
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ connected: false }),
      })
    );
  });

  afterEach(() => {
    // Restore global fetch
    global.fetch.mockRestore();
  });

  it('renders the basic links for unauthenticated users', () => {
    useAuth.mockReturnValue({ token: null, user: null, logout: jest.fn() });

    render(
      <Router>
        <Navbar />
      </Router>
    );

    // Check for unauthenticated links
    expect(screen.getByText(/Logo/i)).toBeInTheDocument();
    expect(screen.getByText(/User Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();

    // Ensure "Home" and "Lobby" are not present
    expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Lobby/i)).not.toBeInTheDocument();
  });

  it('renders user links when a user is logged in', async () => {
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

    // Check for authenticated user links
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Lobby/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();

    // Check for Lichess connection status
    expect(await screen.findByText(/Connect Lichess/i)).toBeInTheDocument();
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

    // Check for admin links
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();

    // Ensure user-specific links are not present
    expect(screen.queryByText(/Home/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Lobby/i)).not.toBeInTheDocument();
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

    const logoutButton = screen.getByText(/Logout/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders the Lichess connection status correctly', async () => {
    global.fetch = jest.fn(() =>
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

    // Check for "Lichess Connected"
    expect(await screen.findByText(/Lichess Connected/i)).toBeInTheDocument();
  });
});

