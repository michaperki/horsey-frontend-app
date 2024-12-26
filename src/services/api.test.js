
// src/services/api.test.js

import { getUserBalance, getUserBets } from './api';

describe('API Service Functions', () => {
  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
  });

  describe('getUserBalance', () => {
    it('should return user balance when API call is successful', async () => {
      const mockBalance = 1000;
      fetch.mockResponseOnce(JSON.stringify({ balance: mockBalance }), { status: 200 });

      const token = 'valid-token';
      localStorage.setItem('token', token);

      const balance = await getUserBalance(token);

      expect(fetch).toHaveBeenCalledWith('/tokens/balance/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect(balance).toBe(mockBalance);
    });

    it('should throw an error when API call fails', async () => {
      const mockError = 'Invalid token';
      fetch.mockResponseOnce(JSON.stringify({ error: mockError }), { status: 401 });

      const token = 'invalid-token';
      localStorage.setItem('token', token);

      await expect(getUserBalance(token)).rejects.toThrow(mockError);

      expect(fetch).toHaveBeenCalledWith('/tokens/balance/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it('should throw a generic error when response is not ok and no error message is provided', async () => {
      // Change the mock response to return a valid JSON object
      fetch.mockResponseOnce('{}', { status: 500 });

      const token = 'any-token';
      localStorage.setItem('token', token);

      await expect(getUserBalance(token)).rejects.toThrow('Failed to fetch user balance');

      expect(fetch).toHaveBeenCalledWith('/tokens/balance/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it('should throw an error when fetch fails due to network issues', async () => {
      const mockError = new Error('Network Error');
      fetch.mockRejectOnce(mockError);

      const token = 'valid-token';
      localStorage.setItem('token', token);

      await expect(getUserBalance(token)).rejects.toThrow('Network Error');

      expect(fetch).toHaveBeenCalledWith('/tokens/balance/user', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });
  });

  describe('getUserBets', () => {
    it('should return user bets when API call is successful', async () => {
      const mockBetsData = {
        bets: [
          {
            _id: 'bet1',
            gameId: 'game123',
            choice: 'white',
            amount: 100,
            status: 'pending',
            createdAt: '2024-12-25T12:00:00.000Z',
          },
          {
            _id: 'bet2',
            gameId: 'game124',
            choice: 'black',
            amount: 200,
            status: 'won',
            createdAt: '2024-12-24T12:00:00.000Z',
          },
        ],
        totalPages: 2,
      };
      fetch.mockResponseOnce(JSON.stringify(mockBetsData), { status: 200 });

      const token = 'valid-token';
      const params = { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' };
      localStorage.setItem('token', token);

      const data = await getUserBets(token, params);

      expect(fetch).toHaveBeenCalledWith('/bets/history?page=1&limit=10&sortBy=createdAt&order=desc', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      expect(data).toEqual(mockBetsData);
    });

    it('should throw an error when API call fails', async () => {
      const mockError = 'Unauthorized';
      fetch.mockResponseOnce(JSON.stringify({ error: mockError }), { status: 403 });

      const token = 'invalid-token';
      const params = { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' };
      localStorage.setItem('token', token);

      await expect(getUserBets(token, params)).rejects.toThrow(mockError);

      expect(fetch).toHaveBeenCalledWith('/bets/history?page=1&limit=10&sortBy=createdAt&order=desc', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it('should throw a generic error when response is not ok and no error message is provided', async () => {
      fetch.mockResponseOnce('{}', { status: 500 });

      const token = 'any-token';
      const params = { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' };
      localStorage.setItem('token', token);

      await expect(getUserBets(token, params)).rejects.toThrow('Failed to fetch your bet history');

      expect(fetch).toHaveBeenCalledWith('/bets/history?page=1&limit=10&sortBy=createdAt&order=desc', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });

    it('should throw an error when fetch fails due to network issues', async () => {
      const mockError = new Error('Network Error');
      fetch.mockRejectOnce(mockError);

      const token = 'valid-token';
      const params = { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' };
      localStorage.setItem('token', token);

      await expect(getUserBets(token, params)).rejects.toThrow('Network Error');

      expect(fetch).toHaveBeenCalledWith('/bets/history?page=1&limit=10&sortBy=createdAt&order=desc', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    });
  });
});

