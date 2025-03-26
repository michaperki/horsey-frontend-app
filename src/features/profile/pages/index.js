
// src/pages/Profile/index.js

import React from 'react';
import ProfileHeader from '../components/Header';
import VerticalTabs from '../components/VerticalTabs';
import Overview from '../components/Overview';
import Ratings from '../components/Ratings';
import History from '../components/History';
// import Items from '../../components/Profile/Items';
// import Friends from '../../components/Profile/Friends';
import Account from '../components/Account';
import './Profile.css';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = React.useState('Overview');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Overview':
        return <Overview />;
      case 'Ratings':
        return <Ratings />;
      case 'History':
        return <History />;
      // case 'Items':
      //   return <Items />;
      // case 'Friends':
      //   return <Friends />;
      case 'Account':
        return <Account />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="profile-page">
      <ProfileHeader />
      <div className="profile-content">
        <VerticalTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="tab-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
