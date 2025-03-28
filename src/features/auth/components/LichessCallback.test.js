// src/features/auth/components/LichessCallback.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LichessCallback from './LichessCallback';
import { ApiErrorProvider } from 'features/common/contexts/ApiErrorContext';

jest.mock('../services/api', () => ({
  lichessCallback: jest.fn().mockResolvedValue({ success: true }),
}));

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
      <ApiErrorProvider>
        <MemoryRouter>
          <LichessCallback />
        </MemoryRouter>
      </ApiErrorProvider>
    );
    
    expect(screen.getByText(/Lichess Connection/i)).toBeInTheDocument();
    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();
  });
});
