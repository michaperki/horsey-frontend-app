import React from 'react';
import { render, screen } from '@testing-library/react';
import Profile from './Profile';
import * as jwtDecodeModule from 'jwt-decode';

jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(),
}));

describe('Profile Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders profile information for logged-in user', () => {
        localStorage.setItem('token', 'valid-token');
        jwtDecodeModule.jwtDecode.mockReturnValue({
            name: 'Test User',
            email: 'testuser@example.com',
            role: 'user',
        });

        render(<Profile />);

        expect(screen.getByText('Name:').nextElementSibling).toHaveTextContent('Test User');
        expect(screen.getByText('Email:').nextElementSibling).toHaveTextContent('testuser@example.com');
        expect(screen.getByText('Role:').nextElementSibling).toHaveTextContent('user');
    });

    test('renders fallback for missing token', () => {
        render(<Profile />);

        expect(screen.getByText(/No user data available./i)).toBeInTheDocument();
    });

    test('handles invalid token gracefully', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        localStorage.setItem('token', 'invalid-token');
        jwtDecodeModule.jwtDecode.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        render(<Profile />);

        expect(screen.getByText(/No user data available./i)).toBeInTheDocument();
        consoleSpy.mockRestore();
    });
});
