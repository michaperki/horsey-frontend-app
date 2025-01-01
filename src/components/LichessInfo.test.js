
// src/components/LichessInfo.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LichessInfo from './LichessInfo';

describe('LichessInfo Component', () => {
  // Mock Date.prototype.toLocaleString before each test
  beforeEach(() => {
    jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => '1/1/2025, 12:00:00 PM');
  });

  // Restore the original implementation after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders the username, ratings, and connected date correctly', () => {
    const mockInfo = {
      username: 'TestUser',
      connectedAt: '2024-01-01T10:00:00Z',
      ratings: {
        classical: 1500,
      },
    };

    render(<LichessInfo info={mockInfo} />);

    // Check that the username is rendered
    expect(screen.getByText(/Username:/)).toBeInTheDocument();
    expect(screen.getByText(/TestUser/)).toBeInTheDocument();

    // Check that the Ratings section is rendered
    expect(screen.getByText(/Ratings:/)).toBeInTheDocument();
    expect(screen.getByText(/Classical/)).toBeInTheDocument();
    expect(screen.getByText(/1500/)).toBeInTheDocument();

    // Check for 'Connected Since' and the date
    expect(screen.getByText(/Connected Since:/)).toBeInTheDocument();

    const connectedDateElement = screen.getByTestId('connected-date');
    expect(connectedDateElement).toBeInTheDocument();
    // Using exact match for clarity
    expect(connectedDateElement).toHaveTextContent('1/1/2025, 12:00:00 PM');
  });

  test('renders "N/A" for Connected Since when connectedAt is null', () => {
    const mockInfo = {
      username: 'TestUser',
      ratings: {
        classical: 1500,
      },
      connectedAt: null,
    };

    render(<LichessInfo info={mockInfo} />);

    expect(screen.getByText(/Connected Since:/)).toBeInTheDocument();
    expect(screen.getByTestId('connected-date')).toHaveTextContent('N/A');
  });

  test('renders "N/A" for Connected Since when connectedAt is undefined', () => {
    const mockInfo = {
      username: 'TestUser',
      ratings: {
        classical: 1500,
      },
      // connectedAt is undefined
    };

    render(<LichessInfo info={mockInfo} />);

    expect(screen.getByText(/Connected Since:/)).toBeInTheDocument();
    expect(screen.getByTestId('connected-date')).toHaveTextContent('N/A');
  });
});

