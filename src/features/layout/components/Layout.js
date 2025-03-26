// Enhanced Layout.js
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Bulletin from './Bulletin';
import Sidebar from './Sidebar';
import PlaceBet from '../../betting/components/PlaceBet';
import PlaceBetModal from '../../betting/components/PlaceBetModal';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
  const [isPlaceBetModalOpen, setIsPlaceBetModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Handle scroll events to apply effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open place bet modal with optional variant
  const openPlaceBetModal = (variant = null) => {
    setSelectedVariant(variant);
    setIsPlaceBetModalOpen(true);
  };

  // Close place bet modal
  const closePlaceBetModal = () => {
    setSelectedVariant(null);
    setIsPlaceBetModalOpen(false);
  };

  // Calculate classes based on scroll position
  const layoutContentClass = scrollPosition > 100 
    ? 'layout-content scrolled' 
    : 'layout-content';

  return (
    <div className="layout-container">
      {/* Navbar at the top */}
      <Navbar scrolled={scrollPosition > 50} />

      <div className="app-wrapper">
        <div className={layoutContentClass}>
          {/* Left Sidebar */}
          <aside className="bulletin">
            <Bulletin />
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <Outlet context={{ openPlaceBetModal }} />
          </main>

          {/* Right Sidebar */}
          <aside className="sidebar">
            <Sidebar />
            <div className="placebet-button-container">
              <PlaceBet onOpenModal={() => openPlaceBetModal()} />
            </div>
          </aside>
        </div>
      </div>

      {/* Place Bet Modal */}
      <PlaceBetModal
        isOpen={isPlaceBetModalOpen}
        onClose={closePlaceBetModal}
        preSelectedVariant={selectedVariant}
      />

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default Layout;