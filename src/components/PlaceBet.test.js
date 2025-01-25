
// src/components/PlaceBet.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PlaceBet from './PlaceBet';
import PlaceBetModal from './PlaceBetModal';
import '@testing-library/jest-dom';

// Mock PlaceBetModal
jest.mock('./PlaceBetModal', () => jest.fn(() => null));

describe('PlaceBet Component', () => {
  beforeEach(() => {
    PlaceBetModal.mockClear();
  });

  test('renders "Place a Bet" button', () => {
    render(<PlaceBet />);
    const button = screen.getByRole('button', { name: /Place a Bet/i });
    expect(button).toBeInTheDocument();
  });

  test('opens PlaceBetModal when "Place a Bet" button is clicked', () => {
    render(<PlaceBet />);
    const button = screen.getByRole('button', { name: /Place a Bet/i });
    fireEvent.click(button);

    expect(PlaceBetModal).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        onClose: expect.any(Function),
        preSelectedVariant: null,
      }),
      {}
    );
  });

  test('does not render PlaceBetModal when not opened', () => {
    render(<PlaceBet />);
    expect(PlaceBetModal).not.toHaveBeenCalled();
  });

  test('closes PlaceBetModal when onClose is called', () => {
    render(<PlaceBet />);
    const button = screen.getByRole('button', { name: /Place a Bet/i });
    fireEvent.click(button);

    // Extract the onClose function from the mocked PlaceBetModal
    const onClose = PlaceBetModal.mock.calls[0][0].onClose;

    // Call the onClose function
    onClose();

    // Ensure PlaceBetModal is only rendered once
    expect(PlaceBetModal).toHaveBeenCalledTimes(1);
  });
});
