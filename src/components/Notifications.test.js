// src/components/Notifications.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Notifications from '../components/Notifications';
import { useNotifications } from '../contexts/NotificationsContext';
import { useAuth } from '../contexts/AuthContext';

jest.mock('../contexts/NotificationsContext', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Notifications Component', () => {
  const mockNavigate = jest.fn();

  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });


  it('renders loading state', () => {
    useAuth.mockReturnValue({ user: { id: '123' } });
    useNotifications.mockReturnValue({ notifications: [], unreadCount: 0, loading: true });

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading notifications...')).toBeInTheDocument();
  });

  it('renders empty notifications message', () => {
    useAuth.mockReturnValue({ user: { id: '123' } });
    useNotifications.mockReturnValue({ notifications: [], unreadCount: 0, loading: false });

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

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

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

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

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    const markAllButton = screen.getByText('Mark all as read');
    fireEvent.click(markAllButton);

    await waitFor(() => expect(mockMarkAllAsRead).toHaveBeenCalled());
  });
});
