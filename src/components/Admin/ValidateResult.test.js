import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ValidateResult from './ValidateResult';

describe('ValidateResult Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'valid-admin-token');
  });

  const mockFetch = (response, isError = false) => {
    global.fetch = jest.fn(() =>
      isError
        ? Promise.reject(new Error(response)) // Simulates network error
        : Promise.resolve({
            ok: response.ok,
            json: () => Promise.resolve(response.data),
          })
    );
  };

  test('renders the validation form', () => {
    render(<ValidateResult />);
    expect(screen.getByText(/Validate Lichess Game Result/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Lichess Game ID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validate Result/i })).toBeInTheDocument();
  });

  test('handles successful game result validation', async () => {
    const mockResult = {
      outcome: 'white_win',
      whitePlayer: 'player1',
      blackPlayer: 'player2',
      status: 'valid',
      message: 'Game result validated successfully.',
    };

    mockFetch({ ok: true, data: mockResult });

    render(<ValidateResult />);
    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'gameId123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    await waitFor(() => {
      expect(screen.getByText(/Game result processed successfully./i)).toBeInTheDocument();
      // Use a function matcher for text split across elements
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Outcome: white_win';
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'White Player: player1';
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Black Player: player2';
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Status: valid';
      })).toBeInTheDocument();
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Message: Game result validated successfully.';
      })).toBeInTheDocument();
    });
  });

  test('handles validation error gracefully', async () => {
    mockFetch({ ok: false, data: { error: 'Invalid game ID' } });

    render(<ValidateResult />);
    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'invalidGameId' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid game ID/i)).toBeInTheDocument();
    });
  });

  test('shows error when no token is present', () => {
    localStorage.removeItem('token');
    render(<ValidateResult />);
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));
    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });

  test('handles unexpected API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    mockFetch('Network error', true);

    render(<ValidateResult />);
    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'gameId123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore(); // Restore original console.error behavior
  });
});
