// src/features/auth/components/Register.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { ApiErrorProvider } from 'features/common/contexts/ApiErrorContext';

// Mock the API
jest.mock('../services/api', () => ({
  register: jest.fn()
}));

// Mock the Auth Context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock react-router-dom (for Link and useNavigate)
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>
  };
});

// Helper to wrap components with providers
const renderWithProviders = (ui) => {
  return render(
    <ApiErrorProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ApiErrorProvider>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: jest.fn() });

    renderWithProviders(<Register />);

    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Choose a username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create a password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  test('handles successful registration with token', async () => {
    const mockLogin = jest.fn();
    const mockNavigate = jest.fn();
    require('react-router-dom').useNavigate = () => mockNavigate;

    const { register } = require('../services/api');
    register.mockResolvedValue({ token: 'fake-token' });

    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: mockLogin });

    renderWithProviders(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Choose a username"), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    expect(register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  test('handles successful registration without token', async () => {
    const { register } = require('../services/api');
    register.mockResolvedValue({ success: true });

    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: jest.fn() });

    renderWithProviders(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Choose a username"), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Registration successful/i)).toBeInTheDocument();
    });
  });

  test('handles registration error', async () => {
    const { register } = require('../services/api');
    register.mockRejectedValue(new Error('Registration failed'));

    const { useAuth } = require('../contexts/AuthContext');
    useAuth.mockReturnValue({ login: jest.fn() });

    renderWithProviders(<Register />);

    fireEvent.change(screen.getByPlaceholderText("Choose a username"), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm your password"), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    await waitFor(() => {
      expect(screen.getByText(/Registration failed/i)).toBeInTheDocument();
    });
  });
});
