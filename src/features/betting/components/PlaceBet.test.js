// src/features/betting/components/PlaceBet.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PlaceBet from './PlaceBet';
import { useLichess } from 'features/auth/contexts/LichessContext';
import { createNotification } from 'features/notifications/services/api';

// Mock dependencies
jest.mock('features/auth/contexts/LichessContext', () => ({
  useLichess: jest.fn(),
}));

jest.mock('../../notifications/services/api', () => ({
  createNotification: jest.fn(),
}));

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    motion: {
      button: ({ children, onClick, ...props }) => (
        <button onClick={onClick} {...props}>
          {children}
        </button>
      ),
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

describe('PlaceBet Component', () => {
  const mockOnOpenModal = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    useLichess.mockReturnValue({
      lichessConnected: true,
      triggerShake: jest.fn(),
      loading: false,
    });
  });

  test('renders the Place a Bet button', () => {
    render(<PlaceBet onOpenModal={mockOnOpenModal} />);
    
    // Check for the main text
    expect(screen.getByText(/Place a Bet/i)).toBeInTheDocument();
    
    // Check for the secondary text
    expect(screen.getByText(/Challenge players for tokens/i)).toBeInTheDocument();
  });

  test('opens modal when clicked and Lichess is connected', () => {
    render(<PlaceBet onOpenModal={mockOnOpenModal} />);
    
    // Click the button
    const button = screen.getByText(/Place a Bet/i).closest('button');
    fireEvent.click(button);
    
    // Verify the onOpenModal callback was called
    expect(mockOnOpenModal).toHaveBeenCalled();
  });

  test('does not open modal and triggers shake when Lichess is not connected', async () => {
    const mockTriggerShake = jest.fn();
    
    // Mock Lichess as not connected
    useLichess.mockReturnValue({
      lichessConnected: false,
      triggerShake: mockTriggerShake,
      loading: false,
    });

    // Mock successful notification creation
    createNotification.mockResolvedValueOnce({ success: true });
    
    render(<PlaceBet onOpenModal={mockOnOpenModal} />);
    
    // Click the button
    const button = screen.getByText(/Place a Bet/i).closest('button');
    fireEvent.click(button);
    
    // Verify behavior
    expect(mockTriggerShake).toHaveBeenCalled();
    expect(createNotification).toHaveBeenCalledWith({
      message: 'Please connect your Lichess account before placing a bet.',
      type: 'warning',
    });
    expect(mockOnOpenModal).not.toHaveBeenCalled();
  });

  test('shows loading spinner when in loading state', () => {
    // Mock loading state
    useLichess.mockReturnValue({
      lichessConnected: true,
      triggerShake: jest.fn(),
      loading: true,
    });
    
    render(<PlaceBet onOpenModal={mockOnOpenModal} />);
    
    // The button should have disabled attribute
    const button = screen.getByText(/Place a Bet/i).closest('button');
    expect(button).toBeDisabled();
  });
});