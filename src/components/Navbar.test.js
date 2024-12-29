
// src/components/Navbar.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock the jwtDecode function
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

import { jwtDecode } from 'jwt-decode';

describe('Navbar Component', () => {
  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
    jwtDecode.mockClear();
  });

  test('renders public links when not logged in', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/User Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Register/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();
  });

  test('renders user links when logged in as user and Lichess not connected', async () => {
    const mockUser = { role: 'user' };
    jwtDecode.mockReturnValue(mockUser);
    localStorage.setItem('token', 'valid-user-token');

    fetch.mockResponseOnce(JSON.stringify({ connected: false }), { status: 200 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/lichess/status', {
      headers: {
        Authorization: 'Bearer valid-user-token',
      },
    }));

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Bets/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect Lichess/i)).toBeInTheDocument();
  });

  test('renders user links with Lichess connected', async () => {
    const mockUser = { role: 'user' };
    jwtDecode.mockReturnValue(mockUser);
    localStorage.setItem('token', 'valid-user-token');

    fetch.mockResponseOnce(JSON.stringify({ connected: true }), { status: 200 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/lichess/status', {
      headers: {
        Authorization: 'Bearer valid-user-token',
      },
    }));

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Bets/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.getByText(/Lichess Connected/i)).toBeInTheDocument();
  });

  test('renders admin links when logged in as admin', async () => {
    const mockUser = { role: 'admin' };
    jwtDecode.mockReturnValue(mockUser);
    localStorage.setItem('token', 'valid-admin-token');

    fetch.mockResponseOnce(JSON.stringify({ connected: false }), { status: 200 });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/lichess/status', {
      headers: {
        Authorization: 'Bearer valid-admin-token',
      },
    }));

    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    expect(screen.queryByText(/Available Bets/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Connect Lichess/i)).not.toBeInTheDocument();
  });
});

