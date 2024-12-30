
// src/components/LichessInfo.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import LichessInfo from './LichessInfo';

describe('LichessInfo Component', () => {
  test('renders the username, rating, and connected date correctly', () => {
    const mockInfo = {
      username: 'TestUser',
      rating: 1500,
      connectedAt: '2024-01-01T10:00:00Z',
    };

    render(<LichessInfo info={mockInfo} />);

    // Check that the username and rating are rendered
    expect(screen.getByText(/Username:/)).toBeInTheDocument();
    expect(screen.getByText(/TestUser/)).toBeInTheDocument();
    expect(screen.getByText(/Rating:/)).toBeInTheDocument();
    expect(screen.getByText(/1500/)).toBeInTheDocument();

    // Check for 'Connected Since' and the date
    const connectedSinceElement = screen.getByText(/Connected Since:/);
    expect(connectedSinceElement).toBeInTheDocument();

    const connectedDateElement = screen.getByTestId('connected-date');
    expect(connectedDateElement).toBeInTheDocument();

    // Updated expectation to include milliseconds
    expect(connectedDateElement).toHaveTextContent('2024-01-01T10:00:00.000Z');
  });

  test('renders "N/A" for Connected Since when connectedAt is null', () => {
    const mockInfo = {
      username: 'TestUser',
      rating: 1500,
      connectedAt: null,
    };

    render(<LichessInfo info={mockInfo} />);

    expect(screen.getByText(/Connected Since:/)).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  test('renders "N/A" for Connected Since when connectedAt is undefined', () => {
    const mockInfo = {
      username: 'TestUser',
      rating: 1500,
    };

    render(<LichessInfo info={mockInfo} />);

    expect(screen.getByText(/Connected Since:/)).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

