
// src/pages/Lobby.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Lobby from './Lobby';
import { MemoryRouter } from 'react-router-dom';

// Mock AvailableBets component
jest.mock('../components/AvailableBets', () => () => <div data-testid="available-bets">Available Bets Component</div>);

describe('Lobby Component', () => {
  test('renders Lobby heading and AvailableBets component', () => {
    render(
      <MemoryRouter>
        <Lobby />
      </MemoryRouter>
    );

    expect(screen.getByText('Lobby')).toBeInTheDocument();
    expect(screen.getByTestId('available-bets')).toBeInTheDocument();
  });
});
