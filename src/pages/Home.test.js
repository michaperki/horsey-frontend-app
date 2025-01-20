
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import * as AuthContextModule from '../contexts/AuthContext'; // Import entire module
import * as api from '../services/api';

// Mock the API functions
jest.mock('../services/api', () => ({
  initiateLichessOAuth: jest.fn(),
  getUserProfile: jest.fn(),
  disconnectLichessAccount: jest.fn(), // Ensure correct function name
}));

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Home Component', () => {
  const mockedUseAuth = AuthContextModule.useAuth;

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    api.initiateLichessOAuth.mockClear();
    api.getUserProfile.mockClear();
    api.disconnectLichessAccount.mockClear();
    mockedUseAuth.mockClear();
    jest.clearAllMocks();
  });

  test('renders LichessConnect button when not connected', async () => {
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    api.getUserProfile.mockResolvedValue({ lichessUsername: null });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for loading to finish and LichessConnect to appear
    expect(await screen.findByText(/Connect Your Lichess Account/i)).toBeInTheDocument();
    
    // Ensure PlaceBet is not rendered
    expect(screen.queryByText(/Place a Bet/i)).not.toBeInTheDocument();
  });

  test('redirects to /auth/lichess when Connect button is clicked', async () => {
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    api.getUserProfile.mockResolvedValue({ lichessUsername: null });

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for LichessConnect button to appear
    const button = await screen.findByText(/Connect Your Lichess Account/i);
    fireEvent.click(button);

    expect(api.initiateLichessOAuth).toHaveBeenCalledWith('fake-token');
  });

  test('renders PlaceBet when Lichess is connected', async () => {
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    api.getUserProfile.mockResolvedValue({ lichessUsername: 'TestUser' });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for Lichess connection status to load
    expect(await screen.findByText(/Your Lichess account is connected as/i)).toBeInTheDocument();

    // Check that PlaceBet is rendered
    expect(screen.getByText(/Place a Bet/i)).toBeInTheDocument();
  });

  test('handles Lichess disconnect and re-renders Connect button', async () => {
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    api.getUserProfile.mockResolvedValue({ lichessUsername: 'TestUser' });
    api.disconnectLichessAccount.mockResolvedValue({ success: true });

    // Mock window.confirm to return true
    jest.spyOn(window, 'confirm').mockImplementation(() => true);
    // Optionally, mock window.alert to prevent actual alerts during tests
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for connected status
    expect(await screen.findByText(/Your Lichess account is connected as/i)).toBeInTheDocument();

    const disconnectButton = screen.getByText(/Disconnect Lichess Account/i);
    fireEvent.click(disconnectButton);

    // Wait for disconnect API call
    await waitFor(() => expect(api.disconnectLichessAccount).toHaveBeenCalledWith('fake-token'));

    // After disconnect, "Connect Your Lichess Account" should be rendered
    expect(await screen.findByText(/Connect Your Lichess Account/i)).toBeInTheDocument();

    // Ensure PlaceBet is no longer rendered
    expect(screen.queryByText(/Place a Bet/i)).not.toBeInTheDocument();

    // Restore window.confirm
    window.confirm.mockRestore();
    window.alert.mockRestore();
  });

  test('does not disconnect when user cancels the confirmation', async () => {
    mockedUseAuth.mockReturnValue({ token: 'fake-token' });
    api.getUserProfile.mockResolvedValue({ lichessUsername: 'TestUser' });

    // Mock window.confirm to return false
    jest.spyOn(window, 'confirm').mockImplementation(() => false);
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    // Wait for connected status
    expect(await screen.findByText(/Your Lichess account is connected as/i)).toBeInTheDocument();

    const disconnectButton = screen.getByText(/Disconnect Lichess Account/i);
    fireEvent.click(disconnectButton);

    // Ensure disconnect API was not called
    expect(api.disconnectLichessAccount).not.toHaveBeenCalled();

    // Ensure "Connect Your Lichess Account" is not rendered
    expect(screen.queryByText(/Connect Your Lichess Account/i)).not.toBeInTheDocument();

    // Ensure PlaceBet is still rendered
    expect(screen.getByText(/Place a Bet/i)).toBeInTheDocument();

    // Restore window.confirm
    window.confirm.mockRestore();
    window.alert.mockRestore();
  });
});

