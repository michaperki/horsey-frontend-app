
// src/pages/Dashboard.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

describe('Dashboard Component', () => {
  test('renders LichessConnect button', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Connect Your Lichess Account/i)).toBeInTheDocument();
  });

  test('redirects to /auth/lichess when Connect button is clicked', () => {
    delete window.location;
    window.location = { href: '' };

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    const button = screen.getByText(/Connect Your Lichess Account/i);
    fireEvent.click(button);

    expect(window.location.href).toBe('/auth/lichess');
  });
});
