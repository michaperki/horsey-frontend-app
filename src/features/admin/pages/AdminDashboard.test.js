// src/features/admin/pages/AdminDashboard.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';

// Since navigate is used in the component, we need to mock it
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    // Clear localStorage and mocks
    localStorage.clear();
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  test('redirects to login when no token', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    // Component should call navigate to '/login'
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('renders Admin Dashboard for logged-in admin', () => {
    // Mock localStorage.getItem to return a token
    localStorage.setItem('token', 'fake-token');
    
    // Mock jwt-decode to return an admin user
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue({ role: 'admin' });

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    // Check for admin dashboard title
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
    
    // Check for logout button (this button is present in your component)
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    
    // Note: We're not checking for other elements like "Mint Tokens" etc.
    // because they aren't in the current AdminDashboard component
  });

  test('redirects to login if token has insufficient permissions', () => {
    // Mock localStorage.getItem to return a token
    localStorage.setItem('token', 'fake-token');
    
    // Mock jwt-decode to return a non-admin user
    const { jwtDecode } = require('jwt-decode');
    jwtDecode.mockReturnValue({ role: 'user' });

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    // Component should call navigate to '/login'
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});