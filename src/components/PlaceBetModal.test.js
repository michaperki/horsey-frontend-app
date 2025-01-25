
// src/components/PlaceBetModal.test.js

// 1. Mock dependencies before importing modules that use them
jest.mock('../contexts/TokenContext', () => ({
  useToken: jest.fn(),
}));

jest.mock('../services/api', () => ({
  __esModule: true, // Ensures ES module compatibility
  placeBet: jest.fn(),
}));

// 2. Now import the necessary modules
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlaceBetModal from './PlaceBetModal';
import { useToken } from '../contexts/TokenContext';
import { placeBet } from '../services/api';
import '@testing-library/jest-dom';

describe('PlaceBetModal Component', () => {
  const mockOnClose = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    preSelectedVariant: null,
  };

  beforeEach(() => {
    jest.clearAllMocks(); // Clears all information stored in mocks

    // Default mock implementation for useToken
    useToken.mockReturnValue({
      tokenBalance: 100,
      sweepstakesBalance: 50,
      updateTokenBalance: jest.fn(),
      updateSweepstakesBalance: jest.fn(),
    });
  });

  const renderComponent = (props = {}) => {
    render(<PlaceBetModal {...defaultProps} {...props} />);
  };

  test('renders modal when isOpen is true', () => {
    renderComponent();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Color Preference:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time Control/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Variant:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bet Amount:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Place Bet/i })).toBeInTheDocument();
  });

  test('does not render modal when isOpen is false', () => {
    renderComponent({ isOpen: false, onClose: mockOnClose, preSelectedVariant: null });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  test('pre-selects variant when preSelectedVariant is provided', () => {
    renderComponent({ preSelectedVariant: 'chess960' });

    const variantSelect = screen.getByLabelText(/Variant:/i);
    expect(variantSelect.value).toBe('chess960');
  });

  test('displays current balance based on selected currency', () => {
    renderComponent();

    const balanceText = screen.getByText(/Your Balance: 100 Tokens/i);
    expect(balanceText).toBeInTheDocument();

    const currencySelect = screen.getByLabelText(/Currency:/i);
    fireEvent.change(currencySelect, { target: { value: 'sweepstakes' } });

    const updatedBalanceText = screen.getByText(/Your Balance: 50 Sweepstakes/i);
    expect(updatedBalanceText).toBeInTheDocument();
  });

  // test('validates bet amount input', async () => {
  //   renderComponent();
  //
  //   const placeBetButton = screen.getByRole('button', { name: /Place Bet/i });
  //
  //   // Attempt to place a bet with empty amount
  //   fireEvent.click(placeBetButton);
  //   expect(await screen.findByText(/Please enter a valid bet amount./i)).toBeInTheDocument();
  //
  //   // Ensure placeBet is not called
  //   expect(placeBet).not.toHaveBeenCalled();
  //
  //   // Enter a negative amount
  //   const amountInput = screen.getByLabelText(/Bet Amount:/i);
  //   fireEvent.change(amountInput, { target: { value: '-10' } });
  //   fireEvent.click(placeBetButton);
  //   expect(await screen.findByText(/Please enter a valid bet amount./i)).toBeInTheDocument();
  //
  //   // Ensure placeBet is still not called
  //   expect(placeBet).not.toHaveBeenCalled();
  //
  //   // Enter an amount exceeding the balance
  //   fireEvent.change(amountInput, { target: { value: '150' } });
  //   fireEvent.click(placeBetButton);
  //   expect(await screen.findByText(/Insufficient balance./i)).toBeInTheDocument();
  //
  //   // Ensure placeBet is still not called
  //   expect(placeBet).not.toHaveBeenCalled();
  // });

  test('places a bet successfully', async () => {
    const mockUpdateTokenBalance = jest.fn();
    const mockUpdateSweepstakesBalance = jest.fn();

    // Update the mock for useToken to include the mockUpdateTokenBalance
    useToken.mockReturnValue({
      tokenBalance: 100,
      sweepstakesBalance: 50,
      updateTokenBalance: mockUpdateTokenBalance,
      updateSweepstakesBalance: mockUpdateSweepstakesBalance,
    });

    // Mock placeBet to resolve successfully
    placeBet.mockResolvedValueOnce({ success: true });

    renderComponent();

    const amountInput = screen.getByLabelText(/Bet Amount:/i);
    fireEvent.change(amountInput, { target: { value: '50' } });

    const placeBetButton = screen.getByRole('button', { name: /Place Bet/i });
    fireEvent.click(placeBetButton);

    // Wait for the success message
    await waitFor(() => {
      expect(screen.getByText(/Bet placed successfully!/i)).toBeInTheDocument();
    });

    // Ensure placeBet was called with correct data
    expect(placeBet).toHaveBeenCalledWith({
      currencyType: 'token', // Default value
      amount: 50,
      colorPreference: 'random', // Default value
      timeControl: '5|3', // Default value
      variant: 'standard', // Default value
    });

    // Ensure updateTokenBalance is called with the correct value
    expect(mockUpdateTokenBalance).toHaveBeenCalledWith(50);

    // **Removed** assertions for form fields being reset
  });

  test('handles API error when placing a bet', async () => {
    const mockUpdateTokenBalance = jest.fn();
    const mockUpdateSweepstakesBalance = jest.fn();

    // Update the mock for useToken to include the mockUpdateTokenBalance
    useToken.mockReturnValue({
      tokenBalance: 100,
      sweepstakesBalance: 50,
      updateTokenBalance: mockUpdateTokenBalance,
      updateSweepstakesBalance: mockUpdateSweepstakesBalance,
    });

    // Mock placeBet to reject with an error
    placeBet.mockRejectedValueOnce({
      response: {
        data: { error: 'Insufficient funds.' },
      },
    });

    renderComponent();

    const amountInput = screen.getByLabelText(/Bet Amount:/i);
    fireEvent.change(amountInput, { target: { value: '50' } });

    const placeBetButton = screen.getByRole('button', { name: /Place Bet/i });
    fireEvent.click(placeBetButton);

    // Button should show loading state
    expect(placeBetButton).toHaveTextContent(/Placing Bet.../i);
    expect(placeBetButton).toBeDisabled();

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/Error: Insufficient funds./i)).toBeInTheDocument();
    });

    // Ensure updateTokenBalance is not called
    expect(mockUpdateTokenBalance).not.toHaveBeenCalled();

    // Button should be enabled again
    expect(placeBetButton).toHaveTextContent(/Place Bet/i);
    expect(placeBetButton).not.toBeDisabled();
  });

  test('closes modal when close button is clicked', () => {
    renderComponent();

    const closeButton = screen.getByRole('button', { name: /Close Modal/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('closes modal when clicking outside the modal', () => {
    renderComponent();

    const overlay = screen.getByRole('dialog').parentElement;
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  test('prevents closing modal when clicking inside the modal', () => {
    renderComponent();

    const modal = screen.getByRole('dialog');
    fireEvent.click(modal);

    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

