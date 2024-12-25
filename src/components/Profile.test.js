// src/components/Profile.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Profile from './Profile';
import * as api from '../services/api';

// Mock the getUserBalance function
jest.mock('../services/api');

describe('Profile Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders profile information for logged-in user', async () => {
    localStorage.setItem('token', 'valid-token');
    api.getUserBalance.mockResolvedValue(500); // Mock balance

    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Your Balance: 500 PTK/i)).toBeInTheDocument();
    });
  });

  test('renders error message when user is not logged in', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/User is not logged in/i)).toBeInTheDocument();
    });
  });

  test('handles fetch balance error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    localStorage.setItem('token', 'invalid-token');
    api.getUserBalance.mockRejectedValue(new Error('Invalid token'));

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText(/Invalid token/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
