import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Logout from './Logout';

// Mock useNavigate correctly
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Logout Component', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'valid-token');
  });

  afterEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('logs out the user', () => {
    render(
      <Router>
        <Logout />
      </Router>
    );

    // Simulate button click
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));

    // Assert localStorage and navigation
    expect(localStorage.getItem('token')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login'); // Assert navigation
  });
});
