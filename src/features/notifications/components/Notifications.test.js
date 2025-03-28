// src/features/notifications/components/Notifications.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Notifications from './Notifications';
import { ApiErrorProvider } from 'features/common/contexts/ApiErrorContext';
import { useNotifications } from 'features/notifications/contexts/NotificationsContext';
import { useAuth } from 'features/auth/contexts/AuthContext';

jest.mock('features/notifications/contexts/NotificationsContext', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('features/auth/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Ensure useNavigate returns our mock
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Notifications Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper to wrap with providers
  const renderWithProviders = (ui) => {
    return render(
      <ApiErrorProvider>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </ApiErrorProvider>
    );
  };

  it('renders loading state', () => {
    useAuth.mockReturnValue({ user: { id: '123' } });
    useNotifications.mockReturnValue({ notifications: [], unreadCount: 0, loading: true });

    renderWithProviders(<Notifications />);

    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });

  it('renders empty notifications message', () => {
    useAuth.mockReturnValue({ user: { id: '123' } });
    useNotifications.mockReturnValue({ notifications: [], unreadCount: 0, loading: false });

    renderWithProviders(<Notifications />);

    expect(screen.getByText('No notifications to display.')).toBeInTheDocument();
  });

  it('renders notifications and handles marking one as read', async () => {
    const mockMarkAsRead = jest.fn();
    useAuth.mockReturnValue({ user: { id: '123' } });
    useNotifications.mockReturnValue({
      notifications: [
        { _id: '1', message: 'Test Notification', createdAt: new Date().toISOString(), read: false },
      ],
      unreadCount: 1,
      markAsRead: mockMarkAsRead,
      markAllAsRead: jest.fn(),
      loading: false,
    });

    renderWithProviders(<Notifications />);

    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    const markButton = screen.getByText('Mark as read');

    fireEvent.click(markButton);
    await waitFor(() => expect(mockMarkAsRead).toHaveBeenCalledWith('1'));
  });

  it('handles marking all notifications as read', async () => {
    const mockMarkAllAsRead = jest.fn();
    useAuth.mockReturnValue({ user: { id: '123' } });
    useNotifications.mockReturnValue({
      notifications: [
        { _id: '1', message: 'Notification 1', createdAt: new Date().toISOString(), read: false },
        { _id: '2', message: 'Notification 2', createdAt: new Date().toISOString(), read: false },
      ],
      unreadCount: 2,
      markAsRead: jest.fn(),
      markAllAsRead: mockMarkAllAsRead,
      loading: false,
    });

    renderWithProviders(<Notifications />);

    const markAllButton = screen.getByText('Mark all as read');
    fireEvent.click(markAllButton);

    await waitFor(() => expect(mockMarkAllAsRead).toHaveBeenCalled());
  });
});
