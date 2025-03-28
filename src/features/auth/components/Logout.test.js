// src/features/auth/components/Logout.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Logout from './Logout';

// Mock the useAuth hook
jest.mock('features/auth/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Logout Component', () => {
  beforeEach(() => {
    // Reset mocks
    mockNavigate.mockClear();
  });

  test('renders logout button', () => {
    // Configure mock useAuth hook to return required functions
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({
      logout: jest.fn()
    });

    render(
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    );

    // Check that the logout button is rendered
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  test('calls logout and navigates to login page when clicked', () => {
    // Create a mock logout function
    const mockLogout = jest.fn();
    
    // Configure mock useAuth hook to return our mock logout function
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({
      logout: mockLogout
    });

    render(
      <BrowserRouter>
        <Logout />
      </BrowserRouter>
    );

    // Click the logout button
    fireEvent.click(screen.getByText(/Logout/i));

    // Check that logout was called
    expect(mockLogout).toHaveBeenCalled();
    
    // Check that navigate was called with '/login'
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});