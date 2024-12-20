
// src/components/ProtectedRoute.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import jwtDecode from 'jwt-decode';

// Mock jwtDecode to control user roles and token expiration
jest.mock('jwt-decode', () => jest.fn());

// Define a mock protected component to be rendered when access is granted
const MockComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage before each test
    Storage.prototype.getItem = jest.fn();
  });

  test('redirects to admin login if requiredRole is admin and user is not admin', () => {
    // Mock the localStorage to return a token
    Storage.prototype.getItem.mockReturnValue('mocked_token');

    // Mock jwtDecode to return a user with role 'user' (not 'admin')
    jwtDecode.mockReturnValue({
      role: 'user',
      exp: Math.floor(Date.now() / 1000) + 1000, // Token not expired
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
          {/* Define the admin login route */}
          <Route path="/admin/login" element={<div>Admin Login Page</div>} />
          {/* Define the home route */}
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Assert that the user is redirected to the admin login page
    expect(screen.getByText(/Admin Login Page/i)).toBeInTheDocument();
  });

  test('renders protected component if authenticated and has the required role', () => {
    // Mock the localStorage to return a valid admin token
    Storage.prototype.getItem.mockReturnValue('mocked_admin_token');

    // Mock jwtDecode to return a user with role 'admin'
    jwtDecode.mockReturnValue({
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 1000, // Token not expired
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
          {/* Define the admin login route */}
          <Route path="/admin/login" element={<div>Admin Login Page</div>} />
          {/* Define the home route */}
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Assert that the protected content is rendered
    expect(screen.getByText(/Protected Content/i)).toBeInTheDocument();
  });

  test('redirects to user login if no token is present', () => {
    // Mock the localStorage to return null (no token)
    Storage.prototype.getItem.mockReturnValue(null);

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
          {/* Define the user login route */}
          <Route path="/login" element={<div>User Login Page</div>} />
          {/* Define the home route */}
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Assert that the user is redirected to the user login page
    expect(screen.getByText(/User Login Page/i)).toBeInTheDocument();
  });

  test('redirects to login if token is expired', () => {
    // Mock the localStorage to return a token
    Storage.prototype.getItem.mockReturnValue('mocked_token');

    // Mock jwtDecode to return a user with role 'user' and expired token
    jwtDecode.mockReturnValue({
      role: 'user',
      exp: Math.floor(Date.now() / 1000) - 1000, // Token expired
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
          {/* Define the user login route */}
          <Route path="/login" element={<div>User Login Page</div>} />
          {/* Define the home route */}
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Assert that the user is redirected to the user login page
    expect(screen.getByText(/User Login Page/i)).toBeInTheDocument();
  });
});

