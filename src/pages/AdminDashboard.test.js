
// src/pages/AdminDashboard.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AdminDashboard from './AdminDashboard';
import * as jwtDecodeModule from 'jwt-decode';

jest.mock('jwt-decode', () => ({
    jwtDecode: jest.fn(),
}));

describe('AdminDashboard Component', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders Admin Dashboard for logged-in admin', () => {
        localStorage.setItem('token', 'valid-admin-token');
        jwtDecodeModule.jwtDecode.mockReturnValue({
            role: 'admin',
        });

        render(
            <MemoryRouter>
                <AdminDashboard />
            </MemoryRouter>
        );

        expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/Mint Tokens/i)).toBeInTheDocument();
        expect(screen.getByText(/Check Balance/i)).toBeInTheDocument();
        expect(screen.getByText(/Transfer Tokens/i)).toBeInTheDocument();
        expect(screen.getByText(/Validate Result/i)).toBeInTheDocument();
        expect(screen.getByText(/Logout/i)).toBeInTheDocument();
    });

    test('redirects to login if no token is present', () => {
        const history = createMemoryHistory();
        render(
            <Router location={history.location} navigator={history}>
                <AdminDashboard />
            </Router>
        );

        expect(history.location.pathname).toBe('/login');
    });

    test('redirects to login if token is invalid', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        localStorage.setItem('token', 'invalid-token');
        jwtDecodeModule.jwtDecode.mockImplementation(() => {
            throw new Error('Invalid token');
        });

        const history = createMemoryHistory();
        render(
            <Router location={history.location} navigator={history}>
                <AdminDashboard />
            </Router>
        );

        expect(history.location.pathname).toBe('/login');
        consoleSpy.mockRestore();
    });

    test('logs out correctly and redirects to home', () => {
        localStorage.setItem('token', 'valid-admin-token');
        jwtDecodeModule.jwtDecode.mockReturnValue({
            role: 'admin',
        });

        const history = createMemoryHistory();
        render(
            <Router location={history.location} navigator={history}>
                <AdminDashboard />
            </Router>
        );

        fireEvent.click(screen.getByText(/Logout/i));

        expect(localStorage.getItem('token')).toBeNull();
        expect(history.location.pathname).toBe('/');
    });

    test('redirects to login if user role is not admin', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        localStorage.setItem('token', 'valid-user-token');
        jwtDecodeModule.jwtDecode.mockReturnValue({
            role: 'user',
        });

        const history = createMemoryHistory();
        render(
            <Router location={history.location} navigator={history}>
                <AdminDashboard />
            </Router>
        );

        expect(history.location.pathname).toBe('/login');
        consoleSpy.mockRestore();
    });
});
