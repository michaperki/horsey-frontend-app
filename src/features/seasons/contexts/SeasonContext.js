// src/features/seasons/contexts/SeasonContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useApiError } from '../../common/contexts/ApiErrorContext';

const SeasonContext = createContext();

export const SeasonProvider = ({ children }) => {
  const { token } = useAuth();
  const { handleApiError } = useApiError();
  
  const [activeSeason, setActiveSeason] = useState(null);
  const [seasonLeaderboard, setSeasonLeaderboard] = useState({
    token: [],
    sweepstakes: []
  });
  const [userSeasonStats, setUserSeasonStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch active season data
  const fetchActiveSeason = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchSeasonWithHandling = handleApiError(
        async () => {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/seasons/active`, {
            method: 'GET',
            headers: token ? {
              'Authorization': `Bearer ${token}`
            } : {}
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch active season');
          }
          
          return await response.json();
        },
        {
          showGlobalError: false,
          onError: (err) => setError(err)
        }
      );
      
      const data = await fetchSeasonWithHandling();
      setActiveSeason(data);
    } catch (err) {
      // Error is handled by handleApiError
      console.error('Error fetching active season:', err);
    } finally {
      setLoading(false);
    }
  }, [token, handleApiError]);

  // Fetch season leaderboard
  const fetchSeasonLeaderboard = useCallback(async (currencyType = 'token', limit = 10) => {
    setLoading(true);
    
    try {
      const fetchLeaderboardWithHandling = handleApiError(
        async () => {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/seasons/leaderboard?currencyType=${currencyType}&limit=${limit}`,
            {
              method: 'GET',
              headers: token ? {
                'Authorization': `Bearer ${token}`
              } : {}
            }
          );
          
          if (!response.ok) {
            throw new Error(`Failed to fetch ${currencyType} leaderboard`);
          }
          
          return await response.json();
        },
        {
          showGlobalError: false,
          onError: (err) => console.error(err)
        }
      );
      
      const data = await fetchLeaderboardWithHandling();
      
      setSeasonLeaderboard(prev => ({
        ...prev,
        [currencyType]: data.leaderboard || []
      }));
    } catch (err) {
      // Error is handled by handleApiError
    } finally {
      setLoading(false);
    }
  }, [token, handleApiError]);

  // Fetch user's season stats
  const fetchUserSeasonStats = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    
    try {
      const fetchStatsWithHandling = handleApiError(
        async () => {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/seasons/mystats`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch season stats');
          }
          
          return await response.json();
        },
        {
          showGlobalError: false,
          onError: (err) => console.error(err)
        }
      );
      
      const data = await fetchStatsWithHandling();
      setUserSeasonStats(data);
    } catch (err) {
      // Error is handled by handleApiError
    } finally {
      setLoading(false);
    }
  }, [token, handleApiError]);

  // Initial fetch of season data
  useEffect(() => {
    fetchActiveSeason();
  }, [fetchActiveSeason]);

  // Fetch user season stats when we have a token and active season
  useEffect(() => {
    if (token && activeSeason) {
      fetchUserSeasonStats();
      
      // Fetch both leaderboards
      fetchSeasonLeaderboard('token');
      fetchSeasonLeaderboard('sweepstakes');
    }
  }, [token, activeSeason, fetchUserSeasonStats, fetchSeasonLeaderboard]);

  return (
    <SeasonContext.Provider
      value={{
        activeSeason,
        userSeasonStats,
        seasonLeaderboard,
        loading,
        error,
        fetchActiveSeason,
        fetchUserSeasonStats,
        fetchSeasonLeaderboard
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
};

SeasonProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useSeason = () => useContext(SeasonContext);

export default SeasonContext;
