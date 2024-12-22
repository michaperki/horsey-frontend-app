// src/components/Navbar.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from './Navbar';

jest.mock('jwt-decode');

describe('Navbar Component', () => {
  beforeEach(() => {
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

  test('renders user links when logged in as user', () => {
    localStorage.setItem('token', 'fake-token');
    jwtDecode.mockReturnValue({ role: 'user' });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test('renders admin links when logged in as admin', () => {
    localStorage.setItem('token', 'fake-admin-token');
    jwtDecode.mockReturnValue({ role: 'admin' });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test('handles logout correctly', () => {
    localStorage.setItem('token', 'fake-token');
    jwtDecode.mockReturnValue({ role: 'user' });

    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Logout/i));
    expect(localStorage.getItem('token')).toBeNull();
  });
});
