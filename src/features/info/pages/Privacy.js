// src/features/info/pages/Privacy.js

import React from 'react';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUserLock, FaClipboardList, FaCookieBite, FaUserSecret, FaGlobe } from 'react-icons/fa';
import './InfoPages.css';

const PrivacyPage = () => {
  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <motion.div 
      className="info-page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="info-page-header" variants={itemVariants}>
        <div className="info-page-icon">
          <FaShieldAlt />
        </div>
        <h1>Privacy Policy</h1>
      </motion.div>

      <motion.div className="info-page-content" variants={itemVariants}>
        <motion.div className="info-card policy-meta" variants={itemVariants}>
          <p>Last Updated: March 15, 2025</p>
          <p>Effective Date: March 31, 2025</p>
        </motion.div>

        <motion.p className="info-page-intro" variants={itemVariants}>
          At Horsey, we value your privacy and are committed to protecting your personal information.
          This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
        </motion.p>

        <motion.div className="policy-section" variants={itemVariants}>
          <div className="policy-section-header">
            <FaUserLock className="policy-icon" />
            <h2>Information We Collect</h2>
          </div>
          <div className="policy-content">
            <h3>Personal Information</h3>
            <p>We may collect personal information such as:</p>
            <ul>
              <li>Name and email address when you register</li>
              <li>Lichess account information (username, ratings) if you connect your account</li>
              <li>Payment information when you purchase tokens</li>
              <li>IP address and device information</li>
            </ul>

            <h3>Gameplay Data</h3>
            <p>We collect information about your gameplay, including:</p>
            <ul>
              <li>Game history and results</li>
              <li>Wager amounts and outcomes</li>
              <li>Token balances and transaction history</li>
              <li>Player statistics and ratings</li>
            </ul>
          </div>
        </motion.div>

        <motion.div className="policy-section" variants={itemVariants}>
          <div className="policy-section-header">
            <FaClipboardList className="policy-icon" />
            <h2>How We Use Your Information</h2>
          </div>
          <div className="policy-content">
            <p>We use your information for the following purposes:</p>
            <ul>
              <li>To provide and maintain our services</li>
              <li>To process your transactions and manage your account</li>
              <li>To detect and prevent fraud or cheating</li>
              <li>To improve our platform and develop new features</li>
              <li>To communicate with you about updates, security alerts, and support</li>
              <li>To personalize your experience and provide relevant content</li>
            </ul>
          </div>
        </motion.div>

        <motion.div className="policy-section" variants={itemVariants}>
          <div className="policy-section-header">
            <FaUserSecret className="policy-icon" />
            <h2>Information Sharing</h2>
          </div>
          <div className="policy-content">
            <p>We may share your information with:</p>
            <ul>
              <li>Service providers who help us operate our platform</li>
              <li>Payment processors to complete transactions</li>
              <li>Other users (limited to public profile information like username and ratings)</li>
              <li>Legal authorities when required by law or to protect our rights</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </div>
        </motion.div>

        <motion.div className="policy-section" variants={itemVariants}>
          <div className="policy-section-header">
            <FaCookieBite className="policy-icon" />
            <h2>Cookies and Tracking</h2>
          </div>
          <div className="policy-content">
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Keep you logged in and remember your preferences</li>
              <li>Understand how you use our platform</li>
              <li>Improve our services and user experience</li>
              <li>Provide relevant advertisements</li>
            </ul>
            <p>You can manage cookie preferences through your browser settings.</p>
          </div>
        </motion.div>

        <motion.div className="policy-section" variants={itemVariants}>
          <div className="policy-section-header">
            <FaGlobe className="policy-icon" />
            <h2>International Data Transfers</h2>
          </div>
          <div className="policy-content">
            <p>
              We operate globally and may transfer your information to countries other than your own.
              When we do, we ensure appropriate safeguards are in place to protect your data and comply
              with applicable laws.
            </p>
          </div>
        </motion.div>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <h2>Your Rights and Choices</h2>
          </div>
          <p className="info-card-content">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <div className="rights-grid">
            <div className="rights-item">
              <h3>Access</h3>
              <p>Request a copy of your personal information</p>
            </div>
            <div className="rights-item">
              <h3>Correction</h3>
              <p>Update or correct inaccurate information</p>
            </div>
            <div className="rights-item">
              <h3>Deletion</h3>
              <p>Request deletion of your personal data</p>
            </div>
            <div className="rights-item">
              <h3>Restriction</h3>
              <p>Limit how we use your personal data</p>
            </div>
            <div className="rights-item">
              <h3>Objection</h3>
              <p>Object to certain processing activities</p>
            </div>
            <div className="rights-item">
              <h3>Portability</h3>
              <p>Receive your data in a portable format</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="info-card cta-card" variants={itemVariants}>
          <h2>Contact Us</h2>
          <p>If you have questions or concerns about our Privacy Policy or data practices, please contact us at:</p>
          <a href="mailto:privacy@horseychess.com" className="privacy-email">privacy@horseychess.com</a>
          <p className="address">
            Horsey, Inc.<br />
            123 Chess Square<br />
            San Francisco, CA 94105<br />
            United States
          </p>
        </motion.div>

        <motion.div className="info-page-footer" variants={itemVariants}>
          <p>We may update this Privacy Policy from time to time. When we do, we will post the new Privacy Policy on this page and update the "Last Updated" date above.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PrivacyPage;