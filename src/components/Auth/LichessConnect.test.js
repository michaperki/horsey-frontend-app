
// src/components/Auth/LichessConnect.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LichessConnect from './LichessConnect';

describe('LichessConnect Component', () => {
  test('renders Connect Your Lichess Account button', () => {
    render(
      <MemoryRouter>
        <LichessConnect />
      </MemoryRouter>
    );

    expect(screen.getByText(/Connect Your Lichess Account/i)).toBeInTheDocument();
  });

  test('redirects to /auth/lichess when button is clicked', () => {
    delete window.location;
    window.location = { href: '' };

    render(
      <MemoryRouter>
        <LichessConnect />
      </MemoryRouter>
    );

    const button = screen.getByText(/Connect Your Lichess Account/i);
    fireEvent.click(button);

    expect(window.location.href).toBe('/auth/lichess');
  });
});
