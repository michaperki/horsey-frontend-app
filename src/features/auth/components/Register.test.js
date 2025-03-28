// src/features/auth/components/Register.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';

// Mock the API
jest.mock('../services/api', () => ({
  register: jest.fn()
}));

// Mock the Auth Context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>{children}</a>
  )
}));

describe('Register Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    // Configure useAuth mock
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: jest.fn() });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Check that form elements are rendered
    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('handles successful registration with token', async () => {
    // Configure mocks
    const mockLogin = jest.fn();
    const mockNavigate = jest.fn();

    // Mock navigate
    require('react-router-dom').useNavigate = () => mockNavigate;

    // Mock register API to return a token
    const { register } = require('../services/api');
    register.mockResolvedValue({ token: 'fake-token' });

    // Mock useAuth hook
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: mockLogin });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Check that API was called with correct parameters
    expect(register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // Wait for registration to complete and check that login function was called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('handles successful registration without token', async () => {
    // Mock register API to return success without a token
    const { register } = require('../services/api');
    register.mockResolvedValue({ success: true });

    // Mock useAuth hook
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: jest.fn() });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Wait for registration message to appear
    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });
  });

  test('handles registration error', async () => {
    // Mock register API to throw an error
    const { register } = require('../services/api');
    register.mockRejectedValue(new Error('Registration failed'));

    // Mock useAuth hook
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: jest.fn() });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Fill in form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
    });
  });
});