
// src/components/Auth/LichessCallback.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LichessCallback from './LichessCallback';

// Mock the navigate function
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LichessCallback Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.resetMocks();
  });

  test('displays error when no authorization code is present', () => {
    render(
      <MemoryRouter initialEntries={['/auth/lichess/callback']}>
        <Routes>
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();

    waitFor(() => {
      expect(screen.getByText(/Authorization code not found/i)).toBeInTheDocument();
    });
  });

  test('handles successful connection', async () => {
    fetch.mockResponseOnce(JSON.stringify({ success: true }), { status: 200 });

    render(
      <MemoryRouter initialEntries={['/auth/lichess/callback?code=authcode123&state=xyz']}>
        <Routes>
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Lichess account connected successfully!/i)).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });
  });

  test('handles connection failure from backend', async () => {
    fetch.mockResponseOnce(JSON.stringify({ error: 'Invalid authorization code' }), { status: 400 });

    render(
      <MemoryRouter initialEntries={['/auth/lichess/callback?code=invalid&state=xyz']}>
        <Routes>
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Invalid authorization code/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  test('handles network errors gracefully', async () => {
    fetch.mockRejectOnce(new Error('Network Error'));

    render(
      <MemoryRouter initialEntries={['/auth/lichess/callback?code=authcode123&state=xyz']}>
        <Routes>
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
