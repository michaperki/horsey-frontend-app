
// src/components/Profile/ProfileHeader.js

import React from 'react';
import { useAuth } from 'features/auth/contexts/AuthContext';
import './ProfileHeader.css';

const ProfileHeader = () => {
  const { user } = useAuth(); // Assuming `user` has a `username` field
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality, e.g., redirect to search results
    console.log('Search for:', searchQuery);
  };

  return (
    <div className="profile-header">
      <h1>{user?.username}&apos;s Profile</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">Search</button>
      </form>
    </div>
  );
};

export default ProfileHeader;
