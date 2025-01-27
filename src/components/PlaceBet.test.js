
// src/components/PlaceBet.test.js

import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils'; // Use custom render from test-utils.js
import PlaceBet from './PlaceBet';
import PlaceBetModal from './PlaceBetModal';
import { useLichess } from '../contexts/LichessContext';

// Partial mock of LichessContext
jest.mock('../contexts/LichessContext', () => {
  const actual = jest.requireActual('../contexts/LichessContext');
  return {
    ...actual,
    useLichess: jest.fn(),
  };
});

// Mock PlaceBetModal
jest.mock('./PlaceBetModal', () => jest.fn(() => null));

describe('PlaceBet Component', () => {
  const mockedUseLichessHook = useLichess;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Place a Bet" button', () => {
    mockedUseLichessHook.mockReturnValue({
      lichessConnected: true,
      triggerShake: jest.fn(),
    });

    render(<PlaceBet />);
    const button = screen.getByRole('button', { name: /Place a Bet/i });
    expect(button).toBeInTheDocument();
  });

  it('opens PlaceBetModal when "Place a Bet" button is clicked and Lichess is connected', () => {
    const mockOnClose = jest.fn();
    mockedUseLichessHook.mockReturnValue({
      lichessConnected: true,
      triggerShake: jest.fn(),
    });

    // Mock PlaceBetModal to render a div with role 'dialog' when isOpen is true
    PlaceBetModal.mockImplementation(({ isOpen, onClose, preSelectedVariant }) => {
      if (isOpen) {
        return (
          <div role="dialog" aria-modal="true">
            <button onClick={onClose} aria-label="Close Modal">
              Close
            </button>
            <p>PlaceBetModal Content</p>
          </div>
        );
      }
      return null;
    });

    render(<PlaceBet />);

    const placeBetButton = screen.getByRole('button', { name: /Place a Bet/i });
    fireEvent.click(placeBetButton);

    expect(PlaceBetModal).toHaveBeenCalledWith(
      expect.objectContaining({
        isOpen: true,
        onClose: expect.any(Function),
        preSelectedVariant: null,
      }),
      {}
    );

    // Verify that the modal content is rendered
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/PlaceBetModal Content/i)).toBeInTheDocument();

    // Close the modal
    const closeButton = screen.getByRole('button', { name: /Close Modal/i });
    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open PlaceBetModal and triggers shake when Lichess is not connected', () => {
    const mockTriggerShake = jest.fn();
    mockedUseLichessHook.mockReturnValue({
      lichessConnected: false,
      triggerShake: mockTriggerShake,
      connectLichess: jest.fn(),
      loading: false,
      shake: false,
    });

    render(<PlaceBet />);

    const placeBetButton = screen.getByRole('button', { name: /Place a Bet/i });
    fireEvent.click(placeBetButton);

    // PlaceBetModal should not be rendered
    expect(PlaceBetModal).not.toHaveBeenCalled();

    // Trigger shake should have been called
    expect(mockTriggerShake).toHaveBeenCalledTimes(1);
  });

  it('closes PlaceBetModal when onClose is called', () => {
    const mockOnClose = jest.fn();
    mockedUseLichessHook.mockReturnValue({
      lichessConnected: true,
      triggerShake: jest.fn(),
    });

    // Mock PlaceBetModal to render a div with role 'dialog' when isOpen is true
    PlaceBetModal.mockImplementation(({ isOpen, onClose, preSelectedVariant }) => {
      if (isOpen) {
        return (
          <div role="dialog" aria-modal="true">
            <button onClick={onClose} aria-label="Close Modal">
              Close
            </button>
            <p>PlaceBetModal Content</p>
          </div>
        );
      }
      return null;
    });

    render(<PlaceBet />);

    const placeBetButton = screen.getByRole('button', { name: /Place a Bet/i });
    fireEvent.click(placeBetButton);

    // Verify that the modal content is rendered
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click on Close button
    const closeButton = screen.getByRole('button', { name: /Close Modal/i });
    fireEvent.click(closeButton);

    // Remove the incorrect expectation
    // expect(PlaceBetModal).toHaveBeenCalledWith(
    //   expect.objectContaining({
    //     isOpen: false,
    //     onClose: expect.any(Function),
    //     preSelectedVariant: null,
    //   }),
    //   {}
    // );

    // Verify that the modal is no longer in the document
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

