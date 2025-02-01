
// src/pages/Info/Rules.js

import React from 'react';

const RulesPage = () => {
  return (
    <div className="rules-page bg-primary text-white p-lg rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-md text-center">Game Rules</h1>
      <p className="text-lg mb-md">
        Welcome to the Rules Page! The rules are simple: pretty much anything goes at the moment
        since we are not using real money. Have fun, respect other players, and keep the games
        fair and enjoyable for everyone.
      </p>
      <div className="rules-list p-md bg-secondary rounded-md shadow-sm">
        <ul className="list-disc list-inside text-white">
          <li className="mb-sm">No cheating or using unfair advantages.</li>
          <li className="mb-sm">Respect your opponents.</li>
          <li className="mb-sm">Ensure games are completed once started.</li>
          <li className="mb-sm">Report any issues or concerns to the admin team.</li>
          <li className="mb-sm">Play fair, have fun, and keep the spirit of the game alive!</li>
        </ul>
      </div>
    </div>
  );
};

export default RulesPage;

