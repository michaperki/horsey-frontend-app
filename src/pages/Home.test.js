// src/pages/Home.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './Home';
import { MemoryRouter } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock jwt-decode
jest.mock('jwt-decode');

describe('Home Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Mock useNavigate to return the mockNavigate function
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    // Clear localStorage
    localStorage.clear();
  });

  test('renders welcome message when no token is present', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Welcome to Chess Betting Platform')).toBeInTheDocument();
    expect(screen.getByText('Please sign up or log in to continue.')).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('navigates to /admin/dashboard when token has admin role', () => {
    const adminToken = 'admin-token';
    const decodedAdminToken = { role: 'admin' };
    localStorage.setItem('token', adminToken);
    jwtDecode.mockReturnValue(decodedAdminToken);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(jwtDecode).toHaveBeenCalledWith(adminToken);
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
  });

  test('navigates to /dashboard when token has user role', () => {
    const userToken = 'user-token';
    const decodedUserToken = { role: 'user' };
    localStorage.setItem('token', userToken);
    jwtDecode.mockReturnValue(decodedUserToken);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(jwtDecode).toHaveBeenCalledWith(userToken);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('handles invalid token gracefully', () => {
    const invalidToken = 'invalid-token';
    localStorage.setItem('token', invalidToken);
    jwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(jwtDecode).toHaveBeenCalledWith(invalidToken);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid token:', expect.any(Error));
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('does not navigate when no token is present', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
