
import React from 'react';
import PropTypes from 'prop-types';

const UserGreetingInfo = ({ lichessConnected, lichessUsername, statistics }) => (
  <div className="lichess-greeting-and-info mb-md text-center">
    {lichessConnected ? (
      <>
        <h2 className="text-white font-bold text-xl mb-md">
          Welcome back, {lichessUsername || statistics.username}!
        </h2>
        <div className="additional-info-section flex justify-center gap-5 flex-wrap">
          <div className="info-grid">
            <div className="info-item">
              <span>Karma:</span> {statistics.karma}
            </div>
            <div className="info-item">
              <span>Membership:</span> {statistics.membership}
            </div>
            <div className="info-item">
              <span>Rating Class:</span> {statistics.ratingClass || 'Class B'}
            </div>
          </div>
        </div>
      </>
    ) : (
      <h2 className="text-white font-bold text-xl">
        Welcome! Please connect your Lichess account.
      </h2>
    )}
  </div>
);

UserGreetingInfo.propTypes = {
  lichessConnected: PropTypes.bool.isRequired,
  lichessUsername: PropTypes.string.isRequired,
  statistics: PropTypes.shape({
    username: PropTypes.string.isRequired,
    karma: PropTypes.number.isRequired,
    membership: PropTypes.string.isRequired,
    ratingClass: PropTypes.string.isRequired,
  }).isRequired,
};

export default UserGreetingInfo;
