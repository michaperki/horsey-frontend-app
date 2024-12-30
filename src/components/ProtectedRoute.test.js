
// src/components/ProtectedRoute.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Define a mock protected component to be rendered when access is granted
const MockComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock return value for useAuth
    useAuth.mockReturnValue({
      token: 'mocked_token',
      user: { role: 'user', exp: Math.floor(Date.now() / 1000) + 1000 },
      logout: jest.fn(),
    });
  });

  test('redirects to admin login if requiredRole is admin and user is not admin', () => {
    useAuth.mockReturnValue({
      token: 'mocked_token',
      user: { role: 'user', exp: Math.floor(Date.now() / 1000) + 1000 },
    });

    render(
      <MemoryRouter initialEntries={['/admin/protected']}>
        <Routes>
          <Route
            path="/admin/protected"
            element={
              <ProtectedRoute requiredRole="admin">
                <MockComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div>Admin Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Login Page/i)).toBeInTheDocument();
  });

  test('renders protected component if authenticated and has the required role', () => {
    useAuth.mockReturnValue({
      token: 'mocked_admin_token',
      user: { role: 'admin', exp: Math.floor(Date.now() / 1000) + 1000 },
    });

    render(
      <MemoryRouter initialEntries={['/admin/protected']}>
        <Routes>
          <Route
            path="/admin/protected"
            element={
              <ProtectedRoute requiredRole="admin">
                <MockComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
  });

  test('redirects to user login if no token is present', () => {
    useAuth.mockReturnValue({
      token: null,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MockComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>User Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/User Login Page/i)).toBeInTheDocument();
  });

  test('redirects to login if token is expired', () => {
    useAuth.mockReturnValue({
      token: 'mocked_token',
      user: { role: 'user', exp: Math.floor(Date.now() / 1000) - 1000 },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MockComponent />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>User Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/User Login Page/i)).toBeInTheDocument();
  });
});
