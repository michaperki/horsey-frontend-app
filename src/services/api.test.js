
// src/services/api.test.js

// Import necessary modules
import { jest } from '@jest/globals';

// Mock the fetch API
global.fetch = require('jest-fetch-mock');

describe('API Service Functions', () => {
  let getUserBalances, getUserBets;

  beforeAll(() => {
    // Set the API base URL before importing the API functions
    process.env.REACT_APP_API_URL = 'http://localhost:5000';
    
    // Reset the module registry to ensure the environment variable is recognized
    jest.resetModules();
    
    // Import the API functions after setting the environment variable
    const api = require('./api');
    getUserBalances = api.getUserBalances;
    getUserBets = api.getUserBets;
  });

  beforeEach(() => {
    // Reset fetch mocks and local storage before each test
    fetch.resetMocks();
    localStorage.clear();
  });

  describe('getUserBalances', () => {
    it('should return user balance when API call is successful', async () => {
      const mockBalance = { tokenBalance: 1000, sweepstakesBalance: 500 };
      fetch.mockResponseOnce(JSON.stringify(mockBalance), { status: 200 });

      const token = 'valid-token';
      localStorage.setItem('token', token);

      const balance = await getUserBalances();

      // **Updated URL Below**
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/user/balances', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      expect(balance).toEqual({
        tokenBalance: mockBalance.tokenBalance,
        sweepstakesBalance: mockBalance.sweepstakesBalance,
      });
    });

    it('should throw an error when API call fails', async () => {
      const mockError = 'Invalid token';
      fetch.mockResponseOnce(JSON.stringify({ error: mockError }), { status: 401 });

      const token = 'invalid-token';
      localStorage.setItem('token', token);

      await expect(getUserBalances()).rejects.toThrow(mockError);

      // **Updated URL Below**
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/user/balances', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw a generic error when response is not ok and no error message is provided', async () => {
      fetch.mockResponseOnce('{}', { status: 500 });

      const token = 'any-token';
      localStorage.setItem('token', token);

      await expect(getUserBalances()).rejects.toThrow('API request failed');

      // **Updated URL Below**
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/user/balances', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw an error when fetch fails due to network issues', async () => {
      const mockError = new Error('Network Error');
      fetch.mockRejectOnce(mockError);

      const token = 'valid-token';
      localStorage.setItem('token', token);

      await expect(getUserBalances()).rejects.toThrow('Network Error');

      // **Updated URL Below**
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/user/balances', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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
        ],
        totalPages: 1,
      };
      fetch.mockResponseOnce(JSON.stringify(mockBetsData), { status: 200 });

      const token = 'valid-token';
      const params = { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' };
      localStorage.setItem('token', token);

      const data = await getUserBets(params);

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/bets/history?page=1&limit=10&sortBy=createdAt&order=desc', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
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

      await expect(getUserBets(params)).rejects.toThrow(mockError);

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/bets/history?page=1&limit=10&sortBy=createdAt&order=desc', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw a generic error when response is not ok and no error message is provided', async () => {
      fetch.mockResponseOnce('{}', { status: 500 });

      const token = 'any-token';
      const params = { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' };
      localStorage.setItem('token', token);

      await expect(getUserBets(params)).rejects.toThrow('API request failed');

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/bets/history?page=1&limit=10&sortBy=createdAt&order=desc', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    });

    it('should throw an error when fetch fails due to network issues', async () => {
      const mockError = new Error('Network Error');
      fetch.mockRejectOnce(mockError);

      const token = 'valid-token';
      const params = { page: 1, limit: 10, sortBy: 'createdAt', order: 'desc' };
      localStorage.setItem('token', token);

      await expect(getUserBets(params)).rejects.toThrow('Network Error');

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/bets/history?page=1&limit=10&sortBy=createdAt&order=desc', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    });
  });
});

