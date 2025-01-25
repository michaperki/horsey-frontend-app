
// src/components/LichessInfo.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import LichessInfo from './LichessInfo';
import { formatDate } from '../utils/formatDate'; // Import the utility for mocking

// Mock the formatDate utility
jest.mock('../utils/formatDate');

describe('LichessInfo Component', () => {
  const mockInfo = {
    username: 'testuser',
    connectedAt: '2023-12-31T12:00:00Z',
    ratings: {
      standard: {
        classical: 1800,
        blitz: 1500,
        bullet: 1400,
      },
      variants: {
        crazyhouse: 1600,
        chess960: 1700,
      },
    },
  };

  const mockFormattedDate = '12/31/2023, 12:00:00 PM UTC';

  beforeEach(() => {
    // Mock the return value of formatDate
    formatDate.mockReturnValue(mockFormattedDate);
  });

  afterEach(() => {
    // Reset all mocks after each test to prevent interference
    jest.resetAllMocks();
  });

  it('renders the username and connected date', () => {
    render(<LichessInfo info={mockInfo} />);

    // Debug the rendered DOM
    // screen.debug(); // Uncomment if you need to inspect the DOM

    // Verify static elements
    expect(screen.getByText('Username:')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Connected Since:')).toBeInTheDocument();

    // Verify the connected date element
    const connectedDateElement = screen.getByTestId('connected-date');
    expect(connectedDateElement).toBeInTheDocument();
    expect(connectedDateElement.textContent).toEqual(mockFormattedDate);

    // Ensure the formatDate utility was called with the correct argument
    expect(formatDate).toHaveBeenCalledWith(mockInfo.connectedAt);
  });

  it('renders without crashing when no ratings are provided', () => {
    const noRatingsInfo = {
      username: 'testuser',
      connectedAt: '2023-12-31T12:00:00Z',
      ratings: null,
    };

    render(<LichessInfo info={noRatingsInfo} />);

    // Verify static elements
    expect(screen.getByText('Username:')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();

    // Verify the connected date element
    const connectedDateElement = screen.getByTestId('connected-date');
    expect(connectedDateElement).toBeInTheDocument();
    expect(connectedDateElement.textContent).toEqual(mockFormattedDate);

    // Verify fallback messages
    expect(screen.getByText('No standard ratings available.')).toBeInTheDocument();
    expect(screen.getByText('No variant ratings available.')).toBeInTheDocument();

    // Ensure the formatDate utility was called with the correct argument
    expect(formatDate).toHaveBeenCalledWith(noRatingsInfo.connectedAt);
  });

  it('displays "N/A" for missing connected date and ratings', () => {
    const incompleteInfo = {
      username: 'testuser',
      connectedAt: null,
      ratings: {
        standard: {},
        variants: {},
      },
    };

    // Mock formatDate to return "N/A" when connectedAt is null
    formatDate.mockReturnValueOnce("N/A");

    render(<LichessInfo info={incompleteInfo} />);

    // Verify static elements
    expect(screen.getByText('Username:')).toBeInTheDocument();
    expect(screen.getByText('testuser')).toBeInTheDocument();

    // Verify the connected date element
    const connectedDateElement = screen.getByTestId('connected-date');
    expect(connectedDateElement).toBeInTheDocument();
    expect(connectedDateElement.textContent).toEqual("N/A");

    // Verify fallback messages
    expect(screen.getByText('No standard ratings available.')).toBeInTheDocument();
    expect(screen.getByText('No variant ratings available.')).toBeInTheDocument();

    // Ensure the formatDate utility was called with the correct argument
    expect(formatDate).toHaveBeenCalledWith(incompleteInfo.connectedAt);
  });

  it('displays the standard ratings table', () => {
    render(<LichessInfo info={mockInfo} />);

    // Verify standard ratings headers and data
    expect(screen.getByText('Standard Ratings:')).toBeInTheDocument();
    expect(screen.getByText('Classical')).toBeInTheDocument();
    expect(screen.getByText('Blitz')).toBeInTheDocument();
    expect(screen.getByText('Bullet')).toBeInTheDocument();
    expect(screen.getByText('1800')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('1400')).toBeInTheDocument();
  });

  it('displays the variant ratings table', () => {
    render(<LichessInfo info={mockInfo} />);

    // Verify variant ratings headers and data
    expect(screen.getByText('Variant Ratings:')).toBeInTheDocument();
    expect(screen.getByText('Crazyhouse')).toBeInTheDocument();
    expect(screen.getByText('Chess960')).toBeInTheDocument();
    expect(screen.getByText('1600')).toBeInTheDocument();
    expect(screen.getByText('1700')).toBeInTheDocument();
  });
});

