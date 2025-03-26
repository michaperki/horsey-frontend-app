// src/components/Auth/Logout.test.js

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Logout from './Logout';
import * as AuthContextModule from '../../contexts/AuthContext'; // Import entire module
import { BrowserRouter as Router } from 'react-router-dom';

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

describe('Logout Component', () => {
    const mockedUseAuth = AuthContextModule.useAuth;

    beforeEach(() => {
        localStorage.setItem('token', 'valid-token');
        jest.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
        mockNavigate.mockClear();
    });

    test('logs out the user', () => {
        const mockLogout = jest.fn(() => {
            localStorage.removeItem('token');
        });

        // Mock useAuth to return the logout function
        mockedUseAuth.mockReturnValue({
            logout: mockLogout,
        });

        render(
            <Router>
                <Logout />
            </Router>
        );

        // Simulate button click
        fireEvent.click(screen.getByRole('button', { name: /Logout/i }));

        // Assert that logout was called
        expect(mockLogout).toHaveBeenCalledTimes(1);

        // Assert localStorage and navigation
        expect(localStorage.getItem('token')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/login'); // Assert navigation
    });
});
