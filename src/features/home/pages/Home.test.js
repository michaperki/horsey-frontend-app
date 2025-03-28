// src/features/home/pages/Home.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './Home';

// Mock the context hooks
jest.mock('features/auth/contexts/LichessContext', () => ({
  useLichess: () => ({
    lichessConnected: true,
    lichessUsername: 'testUser',
    loading: false
  })
}));

jest.mock('features/profile/contexts/ProfileContext', () => ({
  useProfile: () => ({
    profile: {
      totalGames: 10,
      averageWager: 25,
      totalWagered: 250,
      averageROI: '10.5',
      totalWinnings: 300,
      totalLosses: 50,
      karma: 100,
      membership: 'Premium',
      username: 'testUser',
      ratingClass: 'Class A'
    },
    loading: false
  })
}));

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useOutletContext: () => ({
    openPlaceBetModal: jest.fn()
  })
}));

// Mock the framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }) => <h2 {...props}>{children}</h2>
  },
  AnimatePresence: ({ children }) => <>{children}</>
}));

// Mock the StatCard component
jest.mock('features/layout/components/StatCard', () => ({
  __esModule: true,
  default: ({ title, value }) => (
    <div data-testid="stat-card">
      <div>{title}</div>
      <div>{value}</div>
    </div>
  )
}));

// Mock the GameModes component
jest.mock('features/home/components/GameModes', () => ({
  __esModule: true,
  default: ({ openPlaceBetModal }) => (
    <div data-testid="game-modes">Game Modes Component</div>
  )
}));

describe('Home component', () => {
  test('renders welcome message with username', () => {
    render(<Home />);
    
    // Looking at the DOM structure, the text is broken across elements
    // So we use a more flexible approach
    const welcomeBack = screen.getByText(/Welcome back,/i);
    expect(welcomeBack).toBeInTheDocument();
    
    const username = screen.getByText('testUser!');
    expect(username).toBeInTheDocument();
  });

  test('renders stat cards', () => {
    render(<Home />);
    
    const statCards = screen.getAllByTestId('stat-card');
    expect(statCards.length).toBe(6); // We expect 6 stat cards
  });

  test('renders game modes component', () => {
    render(<Home />);
    
    const gameModes = screen.getByTestId('game-modes');
    expect(gameModes).toBeInTheDocument();
  });
});