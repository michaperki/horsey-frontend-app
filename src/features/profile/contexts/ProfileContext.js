import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUserProfile } from '../services/api';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { useSelectedToken } from 'features/token/contexts/SelectedTokenContext';
import PropTypes from 'prop-types';

// Debounce utility function
const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const { token } = useAuth();
  const { selectedToken } = useSelectedToken();
  const [profile, setProfile] = useState({
    totalGames: 0,
    averageWager: 0,
    totalWagered: 0,
    averageROI: '0.00',
    totalWinnings: 0,
    totalLosses: 0,
    karma: 0,
    membership: 'Free',
    username: 'User',
    ratingClass: 'Default',
  });
  const [seasonData, setSeasonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use a ref to cache profile data and timestamps
  const profileCacheRef = useRef({
    data: null,
    timestamp: 0,
    currencyType: null
  });

  // Cache ttl in milliseconds (5 minutes)
  const CACHE_TTL = 5 * 60 * 1000;

  // Regular fetchProfile function (not debounced)
  const fetchProfileActual = async () => {
    // Check cache first
    const now = Date.now();
    const cache = profileCacheRef.current;

    // If we have valid cached data for this currency type
    if (cache.data &&
        cache.currencyType === selectedToken &&
        (now - cache.timestamp < CACHE_TTL)) {
      console.log('Using cached profile data');
      setProfile(cache.data);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const response = await getUserProfile(selectedToken);
      const { statistics, username, ratingClass } = response;
      const profileData = { ...statistics, username, ratingClass };

      // Update cache
      profileCacheRef.current = {
        data: profileData,
        timestamp: now,
        currencyType: selectedToken
      };

      setProfile(profileData);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err);

      // If we have any cached data, use it as fallback
      if (cache.data) {
        console.log('Using cached profile data as fallback after error');
        setProfile(cache.data);
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of fetchProfile
  // This ensures we don't make too many API calls in quick succession
  const fetchProfile = useCallback(
    debounce(fetchProfileActual, 300),
    [selectedToken]
  );

  // Function to update season data from UserSeasonStats component
  const updateSeasonData = useCallback((data) => {
    setSeasonData(data);
  }, []);

  useEffect(() => {
    if (token && selectedToken) {
      fetchProfile();
    }
  }, [token, selectedToken, fetchProfile]);

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      error,
      refreshProfile: fetchProfile,
      seasonData,
      updateSeasonData
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProfile = () => useContext(ProfileContext);
