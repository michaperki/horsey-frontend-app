
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'features/auth/contexts/AuthContext'; // Use AuthProvider directly
import AdminLogin from './AdminLogin';

global.fetch = jest.fn();
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AdminLogin Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  const renderWithAuthProvider = (ui) => {
    return render(
      <AuthProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthProvider>
    );
  };

  test('renders Admin Login form', () => {
    renderWithAuthProvider(<AdminLogin />);

    expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Admin Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Admin Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login as Admin/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'mocked_token' }),
    });

    renderWithAuthProvider(<AdminLogin />);

    fireEvent.change(screen.getByPlaceholderText(/Admin Email/i), {
      target: { value: 'admin@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Admin Password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Login as Admin/i }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mocked_token');
      expect(screen.getByText(/Admin login successful/i)).toBeInTheDocument();
    });
  });

  test('handles login error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    });

    renderWithAuthProvider(<AdminLogin />);

    fireEvent.click(screen.getByRole('button', { name: /Login as Admin/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});

