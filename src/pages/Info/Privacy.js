
// src/pages/Info/Privacy.js

import React from 'react';

const PrivacyPage = () => {
  return (
    <div className="privacy-page bg-primary text-white p-lg rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-md text-center">Privacy Policy</h1>
      
      <p className="text-lg text-center mb-md">
        Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your information.
      </p>

      {/* Effective date */}
      <p className="text-sm text-center text-gray-300 mb-lg">
        <em>Effective Date: January 31, 2025</em>
      </p>

      <div className="privacy-content p-md bg-secondary rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-sm">1. Information We Collect</h2>
        <p className="mb-sm">
          We may collect personal information, such as your name, email address, and wallet address when you use our platform. 
          Additionally, we may collect non-personal information, such as browser type and usage data.
        </p>

        <h2 className="text-xl font-semibold mb-sm">2. How We Use Your Information</h2>
        <ul className="list-disc list-inside mb-md">
          <li className="mb-sm">To provide and improve our services.</li>
          <li className="mb-sm">To process your game activity, including wagers and results.</li>
          <li className="mb-sm">To communicate with you regarding your account or gameplay updates.</li>
        </ul>

        <h2 className="text-xl font-semibold mb-sm">3. Sharing Your Information</h2>
        <p className="mb-sm">
          We do not sell or share your personal information with third parties, except as necessary to provide services (e.g., payment providers or security services).
        </p>

        <h2 className="text-xl font-semibold mb-sm">4. Security of Your Information</h2>
        <p className="mb-sm">
          We implement security measures to protect your personal data from unauthorized access. However, no online system is completely secure.
        </p>

        <h2 className="text-xl font-semibold mb-sm">5. Your Rights</h2>
        <p className="mb-sm">
          You have the right to access, update, or delete your personal information. Contact us at <a href="mailto:support@example.com" className="text-yellow-400 underline">support@example.com</a> for assistance.
        </p>

        <h2 className="text-xl font-semibold mb-sm">6. Updates to This Policy</h2>
        <p className="mb-md">
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPage;

