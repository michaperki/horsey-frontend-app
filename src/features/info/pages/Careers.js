// src/features/info/pages/Careers.js

import React from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase, FaCode, FaChartLine, FaHeadset, FaLaptopCode, FaChessBoard } from 'react-icons/fa';
import './InfoPages.css';

const CareersPage = () => {
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

  const jobOpenings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote (US/Europe)",
      icon: <FaCode />
    },
    {
      id: 2,
      title: "Backend Engineer",
      department: "Engineering",
      location: "Remote (US/Europe)",
      icon: <FaLaptopCode />
    },
    {
      id: 3,
      title: "Growth Marketing Manager",
      department: "Marketing",
      location: "Remote (US/Europe)",
      icon: <FaChartLine />
    },
    {
      id: 4,
      title: "Customer Support Specialist",
      department: "Operations",
      location: "Remote (US/Europe)",
      icon: <FaHeadset />
    },
    {
      id: 5,
      title: "Chess Content Creator",
      department: "Content",
      location: "Remote (US/Europe)",
      icon: <FaChessBoard />
    }
  ];

  return (
    <motion.div 
      className="info-page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="info-page-header" variants={itemVariants}>
        <div className="info-page-icon">
          <FaBriefcase />
        </div>
        <h1>Careers at Horsey</h1>
      </motion.div>

      <motion.div className="info-page-content" variants={itemVariants}>
        <motion.p className="info-page-intro" variants={itemVariants}>
          Join our talented team and help shape the future of online chess! At Horsey, we're building an innovative 
          platform that combines strategic gameplay with competitive stakes in a vibrant community.
        </motion.p>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <h2>Why Work With Us</h2>
          </div>
          <div className="info-benefits-grid">
            <div className="info-benefit-item">
              <div className="benefit-icon">🌐</div>
              <h3>Remote-First Culture</h3>
              <p>Work from anywhere with flexible hours and a results-oriented environment.</p>
            </div>
            <div className="info-benefit-item">
              <div className="benefit-icon">🚀</div>
              <h3>Growth Opportunity</h3>
              <p>Join a rapidly expanding platform with opportunities to advance your career.</p>
            </div>
            <div className="info-benefit-item">
              <div className="benefit-icon">🏆</div>
              <h3>Competitive Compensation</h3>
              <p>Enjoy competitive salaries, equity options, and comprehensive benefits.</p>
            </div>
            <div className="info-benefit-item">
              <div className="benefit-icon">♟️</div>
              <h3>Passion for Chess</h3>
              <p>Work with fellow chess enthusiasts who love the game as much as you do.</p>
            </div>
          </div>
        </motion.div>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <h2>Open Positions</h2>
          </div>
          <div className="job-listings">
            {jobOpenings.map(job => (
              <motion.div 
                key={job.id} 
                className="job-card"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)"
                }}
              >
                <div className="job-icon">{job.icon}</div>
                <div className="job-details">
                  <h3>{job.title}</h3>
                  <p>{job.department} • {job.location}</p>
                </div>
                <button className="job-apply-btn">Apply</button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="info-card" variants={itemVariants}>
          <div className="info-card-header">
            <h2>Our Hiring Process</h2>
          </div>
          <div className="hiring-process">
            <div className="process-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Application Review</h3>
                <p>Our team reviews your application and resume</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Initial Interview</h3>
                <p>Get to know the team and discuss your experience</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Technical Assessment</h3>
                <p>Complete a relevant challenge based on your role</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Final Interview</h3>
                <p>Meet with leadership for culture fit and final questions</p>
              </div>
            </div>
            <div className="process-step">
              <div className="step-number">5</div>
              <div className="step-content">
                <h3>Offer</h3>
                <p>Receive your offer and welcome to the team!</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="info-card cta-card" variants={itemVariants}>
          <h2>Don't See Your Role?</h2>
          <p>We're always looking for talented individuals to join our team. Send your resume and tell us how you can contribute!</p>
          <button className="cta-button">Contact Us</button>
        </motion.div>

        <motion.div className="info-page-footer" variants={itemVariants}>
          <p>Horsey is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CareersPage;