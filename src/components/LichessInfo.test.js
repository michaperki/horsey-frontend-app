
// src/components/LichessInfo.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import LichessInfo from './LichessInfo';

describe('LichessInfo Component', () => {
  test('renders Lichess information correctly', () => {
    const mockInfo = {
      username: 'LichessUser',
      rating: 2000,
      connectedAt: '2024-01-01T12:00:00Z',
    };

    render(<LichessInfo info={mockInfo} />);

    expect(screen.getByText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByText(mockInfo.username)).toBeInTheDocument();
    expect(screen.getByText(/Rating:/i)).toBeInTheDocument();
    expect(screen.getByText(mockInfo.rating.toString())).toBeInTheDocument();
    expect(screen.getByText(/Connected Since:/i)).toBeInTheDocument();
    expect(screen.getByText(new Date(mockInfo.connectedAt).toLocaleString())).toBeInTheDocument();
  });
});
