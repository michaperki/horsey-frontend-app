// src/features/info/pages/Blog.js

import React from 'react';
import { motion } from 'framer-motion';
import { FaNewspaper, FaSearch, FaTags, FaChessKnight, FaCoins, FaTrophy, FaChartLine } from 'react-icons/fa';
import './InfoPages.css';

const BlogPage = () => {
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

  // Mock blog posts data
  const blogPosts = [
    {
      id: 1,
      title: "Introducing Player Tokens: A New Way to Compete",
      excerpt: "Learn about our new token system and how it enhances your chess experience on Horsey.",
      date: "March 15, 2025",
      author: "Alex Thompson",
      category: "Platform Updates",
      image: "/images/tokens.jpg",
      icon: <FaCoins />
    },
    {
      id: 2,
      title: "Mastering Chess Openings: The Sicilian Defense",
      excerpt: "A comprehensive guide to one of the most popular and effective openings for black pieces.",
      date: "March 10, 2025",
      author: "Grandmaster Julia Chen",
      category: "Chess Strategy",
      image: "/images/sicilian.jpg",
      icon: <FaChessKnight />
    },
    {
      id: 3,
      title: "Upcoming Spring Tournament: $5,000 Prize Pool",
      excerpt: "Join our biggest tournament yet with players from around the world competing for glory and prizes.",
      date: "March 5, 2025",
      author: "Tournament Team",
      category: "Events",
      image: "/images/tournament.jpg",
      icon: <FaTrophy />
    },
    {
      id: 4,
      title: "How to Analyze Your Games for Maximum Improvement",
      excerpt: "Practical tips and tools to help you learn from every match and steadily improve your rating.",
      date: "February 28, 2025",
      author: "Coach Michael Brown",
      category: "Training",
      image: "/images/analysis.jpg",
      icon: <FaChartLine />
    }
  ];

  // Categories for filter
  const categories = ["All", "Platform Updates", "Chess Strategy", "Events", "Training", "Community"];

  return (
    <motion.div 
      className="info-page-container"
      variants={pageVariants}
      initial="initial"
      animate="animate"
    >
      <motion.div className="info-page-header" variants={itemVariants}>
        <div className="info-page-icon">
          <FaNewspaper />
        </div>
        <h1>Horsey Blog</h1>
      </motion.div>

      <motion.div className="info-page-content" variants={itemVariants}>
        <motion.p className="info-page-intro" variants={itemVariants}>
          Stay up to date with the latest news, strategies, and community events on the Horsey platform.
          Our blog features insights from chess experts, platform updates, and upcoming tournaments.
        </motion.p>

        <motion.div className="blog-controls" variants={itemVariants}>
          <div className="blog-search">
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search articles..." />
          </div>
          <div className="blog-categories">
            <FaTags className="categories-icon" />
            <div className="category-filters">
              {categories.map((category, index) => (
                <button 
                  key={index} 
                  className={`category-filter ${index === 0 ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div className="featured-post" variants={itemVariants}>
          <div className="featured-post-content">
            <div className="post-meta">
              <span className="post-category">Featured</span>
              <span className="post-date">March 20, 2025</span>
            </div>
            <h2>The Future of Competitive Chess Gaming</h2>
            <p>
              How blockchain technology and skill-based wagering are transforming the chess world.
              Learn about the latest trends and what to expect in the coming years.
            </p>
            <div className="post-author">By Jessica Williams, CEO</div>
            <button className="read-more-btn">Read Article</button>
          </div>
          <FaChessKnight className="featured-post-icon" />
        </motion.div>

        <motion.div className="blog-grid" variants={itemVariants}>
          {blogPosts.map(post => (
            <motion.div 
              key={post.id} 
              className="blog-card"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <div className="blog-card-icon">
                {post.icon}
              </div>
              <div className="blog-card-content">
                <div className="post-meta">
                  <span className="post-category">{post.category}</span>
                  <span className="post-date">{post.date}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="post-footer">
                  <span>By {post.author}</span>
                  <button className="read-more-link">Read more →</button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="newsletter-signup" variants={itemVariants}>
          <h2>Subscribe to Our Newsletter</h2>
          <p>
            Get the latest chess strategies, tournament announcements, and platform updates 
            delivered straight to your inbox.
          </p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button className="subscribe-btn">Subscribe</button>
          </div>
        </motion.div>

        <motion.div className="info-card cta-card" variants={itemVariants}>
          <h2>Join the Conversation</h2>
          <p>
            Have a topic you'd like us to cover? Want to share your chess journey with our community?
            We're always looking for guest contributors and topic suggestions.
          </p>
          <button className="cta-button">Contact Our Editorial Team</button>
        </motion.div>

        <motion.div className="info-page-footer" variants={itemVariants}>
          <p>© 2025 Horsey. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default BlogPage;