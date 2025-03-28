// src/features/auth/components/UserLogin.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserLogin from './UserLogin';
import { ApiErrorProvider } from 'features/common/contexts/ApiErrorContext';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock the API
jest.mock('../services/api', () => ({
  login: jest.fn()
}));

// Mock the Auth Context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('UserLogin Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProviders = (ui) => {
    return render(
      <ApiErrorProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </ApiErrorProvider>
    );
  };

  test('renders login form', () => {
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: jest.fn() });

    renderWithProviders(<UserLogin />);

    // Check that form elements are rendered
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    const mockAuthLogin = jest.fn();
    const mockNavigate = jest.fn();

    // Mock useNavigate
    require('react-router-dom').useNavigate = () => mockNavigate;

    // Mock login API function
    const { login } = require('../services/api');
    login.mockResolvedValue('fake-token');

    // Mock useAuth hook
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: mockAuthLogin });

    renderWithProviders(<UserLogin />);

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check that API was called with correct parameters
    expect(login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });

    // Wait for login to complete and check that context login function was called
    await waitFor(() => {
      expect(mockAuthLogin).toHaveBeenCalledWith('fake-token');
      // Optionally: expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('handles login error', async () => {
    const mockAuthLogin = jest.fn();
    const mockNavigate = jest.fn();

    // Mock useNavigate
    require('react-router-dom').useNavigate = () => mockNavigate;

    // Mock login API function to throw an error
    const { login } = require('../services/api');
    login.mockRejectedValue(new Error('Invalid credentials'));

    // Mock useAuth hook
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: mockAuthLogin });

    renderWithProviders(<UserLogin />);

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Check that error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
