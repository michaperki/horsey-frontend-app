// src/features/betting/components/YourBets.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourBets from './YourBets';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { useApiError } from 'features/common/contexts/ApiErrorContext';
import { getUserBets } from 'features/betting/services/api';

jest.mock('features/auth/contexts/AuthContext');
jest.mock('features/common/contexts/ApiErrorContext');
jest.mock('features/betting/services/api');

beforeEach(() => {
  jest.clearAllMocks();

  useAuth.mockReturnValue({
    token: 'valid-token',
    user: { id: 'user1', name: 'Test User' },
  });

  useApiError.mockReturnValue({
    handleApiError: jest.fn((apiCall, { onError }) => async () => {
      try {
        return await apiCall();
      } catch (err) {
        onError(err);
        throw err;
      }
    }),
  });
});

test('handles API error correctly', async () => {
  getUserBets.mockRejectedValue({
    code: 'API_ERROR',
    message: 'Failed to fetch bets',
  });

  render(<YourBets />);

  await waitFor(() => {
    expect(screen.getByText(/Failed to fetch bets/i)).toBeInTheDocument();
  });
});
