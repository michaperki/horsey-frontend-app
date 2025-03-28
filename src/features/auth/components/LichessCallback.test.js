// src/features/auth/components/LichessCallback.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LichessCallback from './LichessCallback';

// Mock the api module
jest.mock('../services/api', () => ({
  api: {
    lichessCallback: jest.fn().mockResolvedValue({ success: true }),
  }
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    search: '?code=testcode&state=teststate'
  })
}));

describe('LichessCallback Component', () => {
  test('renders loading state', () => {
    render(
      <MemoryRouter>
        <LichessCallback />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Lichess Connection/i)).toBeInTheDocument();
    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();
  });
});