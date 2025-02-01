
// src/pages/Info/About.js

import React from 'react';

const AboutPage = () => {
  return (
    <div className="about-page bg-primary text-white p-lg rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-md text-center">About Us</h1>
      <p className="text-lg mb-md">
        Welcome to our gaming platform! We're building an exciting space where players can enjoy
        competitive games, challenge themselves, and eventually place real wagers.
      </p>
      <div className="about-content p-md bg-secondary rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-sm">Our Mission</h2>
        <p className="mb-md">
          Our mission is to create a safe, secure, and engaging environment where players can
          compete for fun, and soon, for real money stakes. We are dedicated to fair play, community
          growth, and responsible gambling practices.
        </p>
        <h2 className="text-xl font-semibold mb-sm">What We Offer</h2>
        <ul className="list-disc list-inside text-white">
          <li className="mb-sm">Competitive games designed to test your skills and strategy.</li>
          <li className="mb-sm">Opportunities to participate in both friendly matches and high-stakes games.</li>
          <li className="mb-sm">Secure infrastructure to ensure fairness and transparency.</li>
          <li className="mb-sm">Support for responsible gaming with tools to help you manage your activity.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-md mb-sm">Looking Ahead</h2>
        <p className="mb-md">
          We are actively working on expanding our platform to support real-money gameplay.
          Our commitment to player security and responsible gaming remains at the forefront of these developments.
        </p>
        <h2 className="text-xl font-semibold mt-md mb-sm">Join Us!</h2>
        <p>
          Whether you're here for fun or future competition, there's a place for you. Sign up now
          and be part of our journey as we continue to grow and innovate!
        </p>
      </div>
    </div>
  );
};

export default AboutPage;

