// src/components/Notifications.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import Notifications from './Notifications';
import * as AuthContextModule from '../contexts/AuthContext'; // Import entire module

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('Notifications Component', () => {
    const mockedUseAuth = AuthContextModule.useAuth;

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders message for logged-in user', () => {
        // Mock useAuth to return a logged-in user
        mockedUseAuth.mockReturnValue({
            user: { username: 'TestUser' },
            token: 'valid-token',
            login: jest.fn(),
            logout: jest.fn(),
        });

        render(<Notifications />);

        expect(screen.getByText(/Welcome back, TestUser!/i)).toBeInTheDocument();
        expect(screen.getByText(/Notifications will be displayed here./i)).toBeInTheDocument();
    });

    test('handles invalid token gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

        // Mock useAuth to simulate an invalid token scenario
        mockedUseAuth.mockReturnValue({
            user: null,
            token: null,
            login: jest.fn(),
            logout: jest.fn(),
        });

        render(<Notifications />);

        expect(screen.getByText(/Please log in to see your notifications./i)).toBeInTheDocument();
        expect(screen.getByText(/Notifications will be displayed here./i)).toBeInTheDocument();

        consoleSpy.mockRestore(); // Restore console.error after the test
    });
});
