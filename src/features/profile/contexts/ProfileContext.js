
// src/contexts/ProfileContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
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
  };

  useEffect(() => {
    if (token && selectedToken) {
      fetchProfile();
    }
  }, [token, selectedToken]);

  return (
    <ProfileContext.Provider value={{ profile, loading, error, refreshProfile: fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

ProfileProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProfile = () => useContext(ProfileContext);
