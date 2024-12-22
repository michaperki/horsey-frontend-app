// src/components/Notifications.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Notifications from './Notifications';
import * as jwtDecodeModule from 'jwt-decode'; // Import as a module for mocking

jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(), // Mock the named export
}));

describe('Notifications Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders message for logged-in user', () => {
        localStorage.setItem('token', 'valid-token');
        jwtDecodeModule.jwtDecode.mockReturnValue({ username: 'TestUser' }); // Mock the decoded token

        render(<Notifications />);

        expect(screen.getByText(/Welcome back, TestUser!/i)).toBeInTheDocument();
        expect(screen.getByText(/Notifications will be displayed here./i)).toBeInTheDocument();
    });

    test('handles invalid token gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

        localStorage.setItem('token', 'invalid-token');
        jwtDecodeModule.jwtDecode.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        render(<Notifications />);

        expect(screen.getByText(/Please log in to see your notifications./i)).toBeInTheDocument();
        expect(screen.getByText(/Notifications will be displayed here./i)).toBeInTheDocument();

        consoleSpy.mockRestore(); // Restore console.error after the test
    });
});
