import React from 'react';
import PropTypes from 'prop-types';
import { formatDate } from 'features/common/utils/formatDate';

const UserGreetingInfo = ({
  lichessConnected,
  lichessUsername = '',
  statistics = { username: '', karma: 0, membership: 'Free', ratingClass: 'Class B' },
}) => {
  if (lichessConnected) {
    const username = lichessUsername || statistics.username || 'User';
    const karma = statistics.karma;
    const membership = statistics.membership;
    const ratingClass = statistics.ratingClass;

    return (
      <div className="lichess-greeting-and-info mb-md text-center">
        <h2 className="text-white font-bold text-xl mb-md">
          Welcome back, {username}!
        </h2>
        <div className="additional-info-section flex justify-center gap-5 flex-wrap">
          <div className="info-grid">
            <div className="info-item">
              <span>Karma:</span> {karma}
            </div>
            <div className="info-item">
              <span>Membership:</span> {membership}
            </div>
            <div className="info-item">
              <span>Rating Class:</span> {ratingClass}
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="lichess-greeting-and-info mb-md text-center">
        <h2 className="text-white font-bold text-xl">
          Welcome! Please connect your Lichess account.
        </h2>
      </div>
    );
  }
};

UserGreetingInfo.propTypes = {
  lichessConnected: PropTypes.bool.isRequired,
  lichessUsername: PropTypes.string,
  statistics: PropTypes.shape({
    username: PropTypes.string,
    karma: PropTypes.number,
    membership: PropTypes.string,
    ratingClass: PropTypes.string,
  }),
};

export default UserGreetingInfo;
