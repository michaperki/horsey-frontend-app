// src/components/Auth/LichessConnect.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LichessConnect from './LichessConnect';
import * as AuthContextModule from '../../contexts/AuthContext'; // Import the entire module
import * as api from '../../services/api';

// Mock the initiateLichessOAuth function
jest.mock('../../services/api', () => ({
  initiateLichessOAuth: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('LichessConnect Component', () => {
  const mockedUseAuth = AuthContextModule.useAuth;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    api.initiateLichessOAuth.mockClear();
    mockedUseAuth.mockClear();
  });

  test('renders Connect Your Lichess Account button', () => {
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });

    render(
      <MemoryRouter>
        <LichessConnect />
      </MemoryRouter>
    );

    expect(screen.getByText(/Connect Your Lichess Account/i)).toBeInTheDocument();
  });

  test('shows error message when user is not authenticated', () => {
    mockedUseAuth.mockReturnValue({ token: null }); // No token provided

    render(
      <MemoryRouter>
        <LichessConnect />
      </MemoryRouter>
    );

    const button = screen.getByText(/Connect Your Lichess Account/i);
    fireEvent.click(button);

    expect(screen.getByText(/You must log in to connect your Lichess account./i)).toBeInTheDocument();
    expect(api.initiateLichessOAuth).not.toHaveBeenCalled();
  });

  test('calls initiateLichessOAuth with token when button is clicked', () => {
    const fakeToken = 'fake-token';
    mockedUseAuth.mockReturnValue({ token: fakeToken });

    render(
      <MemoryRouter>
        <LichessConnect />
      </MemoryRouter>
    );

    const button = screen.getByText(/Connect Your Lichess Account/i);
    fireEvent.click(button);

    expect(api.initiateLichessOAuth).toHaveBeenCalledWith(fakeToken);
  });
});
