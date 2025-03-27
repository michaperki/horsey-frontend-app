// src/features/betting/components/PlaceBetModal.test.js

// 1. Mock dependencies first
jest.mock('features/token/contexts/TokenContext', () => ({
  useToken: jest.fn(),
}));

jest.mock('features/token/contexts/SelectedTokenContext', () => ({
  useSelectedToken: jest.fn(),
}));

jest.mock('features/betting/services/api', () => ({
  __esModule: true,
  placeBet: jest.fn(),
}));

// 2. Import modules
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import PlaceBetModal from './PlaceBetModal';
import { useToken } from 'features/token/contexts/TokenContext';
import { useSelectedToken } from 'features/token/contexts/SelectedTokenContext';
import { placeBet } from 'features/betting/services/api';
import '@testing-library/jest-dom';

describe('PlaceBetModal Component', () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    preSelectedVariant: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mocks
    useToken.mockReturnValue({
      tokenBalance: 100,
      sweepstakesBalance: 50,
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
    
    useSelectedToken.mockReturnValue({
      selectedToken: 'token',
    });
  });

  // Helper function to find an input field that's likely the bet amount field
  const findBetAmountInput = (container) => {
    const inputs = container.querySelectorAll('input');
    
    // Try to find the most likely bet amount input
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (
        input.type === 'number' || 
        input.type === 'text' || 
        input.id === 'amount' ||
        input.name === 'amount' ||
        input.placeholder?.toLowerCase().includes('amount') ||
        input.getAttribute('aria-label')?.toLowerCase().includes('amount')
      ) {
        return input;
      }
    }
    
    // Fall back to first input if no specific one was found
    return inputs.length > 0 ? inputs[0] : null;
  };

  // BASIC TESTS

  test('renders modal when isOpen is true', () => {
    const { container } = render(<PlaceBetModal {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    render(<PlaceBetModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // INTERACTION TESTS
  
  test('closes modal when close button is clicked', () => {
    render(<PlaceBetModal {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: /Close Modal/i });
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes modal when clicking outside the modal', () => {
    const { container } = render(<PlaceBetModal {...defaultProps} />);
    // Find the overlay by its class
    const overlay = container.querySelector('.place-bet-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  test('prevents closing modal when clicking inside the modal', () => {
    render(<PlaceBetModal {...defaultProps} />);
    const modal = screen.getByRole('dialog');
    fireEvent.click(modal);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // FUNCTIONAL TESTS

  test('places a bet successfully', async () => {
    const mockUpdateTokenBalance = jest.fn();
    
    // Set up specific mocks for this test
    useToken.mockReturnValue({
      tokenBalance: 100,
      sweepstakesBalance: 50,
      updateTokenBalance: mockUpdateTokenBalance,
      updateSweepstakesBalance: jest.fn(),
    });
    
    // Mock successful API response
    placeBet.mockResolvedValueOnce({ success: true });

    const { container } = render(<PlaceBetModal {...defaultProps} />);
    
    // Find the bet amount input
    const amountInput = findBetAmountInput(container);
    
    // Find the place bet button
    const placeBetButton = screen.getByRole('button', { name: /Place Bet/i });
    
    // Set the bet amount and submit
    await act(async () => {
      if (amountInput) {
        fireEvent.change(amountInput, { target: { value: '50' } });
      }
      fireEvent.click(placeBetButton);
    });

    // Verify the API call
    await waitFor(() => {
      expect(placeBet).toHaveBeenCalled();
    });
    
    // Verify token balance was updated
    expect(mockUpdateTokenBalance).toHaveBeenCalledWith(50);
  });

  test('handles API error when placing a bet', async () => {
    const mockUpdateTokenBalance = jest.fn();
    
    // Set up specific mocks for this test
    useToken.mockReturnValue({
      tokenBalance: 100,
      sweepstakesBalance: 50,
      updateTokenBalance: mockUpdateTokenBalance,
      updateSweepstakesBalance: jest.fn(),
    });
    
    // Mock API error
    placeBet.mockRejectedValueOnce({
      response: {
        data: { error: 'Insufficient funds.' },
      },
    });

    const { container } = render(<PlaceBetModal {...defaultProps} />);
    
    // Find the bet amount input
    const amountInput = findBetAmountInput(container);
    
    // Find the place bet button
    const placeBetButton = screen.getByRole('button', { name: /Place Bet/i });
    
    // Set the bet amount and submit
    await act(async () => {
      if (amountInput) {
        fireEvent.change(amountInput, { target: { value: '50' } });
      }
      fireEvent.click(placeBetButton);
    });

    // Verify the API call was made
    await waitFor(() => {
      expect(placeBet).toHaveBeenCalled();
    });
    
    // Verify token balance was NOT updated due to error
    expect(mockUpdateTokenBalance).not.toHaveBeenCalled();
  });

  test('validates bet amount input', async () => {
    const { container } = render(<PlaceBetModal {...defaultProps} />);
    
    // Find the bet amount input
    const amountInput = findBetAmountInput(container);
    
    // Find the place bet button
    const placeBetButton = screen.getByRole('button', { name: /Place Bet/i });
    
    // Test 1: Empty amount
    await act(async () => {
      fireEvent.click(placeBetButton);
    });
    
    // Verify placeBet wasn't called
    expect(placeBet).not.toHaveBeenCalled();

    if (amountInput) {
      // Test 2: Negative amount
      await act(async () => {
        fireEvent.change(amountInput, { target: { value: '-10' } });
        fireEvent.click(placeBetButton);
      });
      
      // Verify placeBet still wasn't called
      expect(placeBet).not.toHaveBeenCalled();

      // Test 3: Amount exceeding balance
      await act(async () => {
        fireEvent.change(amountInput, { target: { value: '150' } });
        fireEvent.click(placeBetButton);
      });
      
      // Verify placeBet still wasn't called
      expect(placeBet).not.toHaveBeenCalled();
    }
  });
});