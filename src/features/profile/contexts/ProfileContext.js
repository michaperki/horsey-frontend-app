import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserProfile } from '../services/api';
import { useAuth } from 'features/auth/contexts/AuthContext';
import { useSelectedToken } from 'features/token/contexts/SelectedTokenContext';
import PropTypes from 'prop-types';

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

  // Memoized fetchProfile to ensure stability in useEffect dependencies
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserProfile(selectedToken);
      const { statistics, username, ratingClass } = response;
      setProfile({ ...statistics, username, ratingClass });
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [selectedToken]);

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
