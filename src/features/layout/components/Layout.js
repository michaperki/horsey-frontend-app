// src/features/layout/components/Layout.js

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Bulletin from './Bulletin';
import Sidebar from './Sidebar';
import PlaceBet from '../../betting/components/PlaceBet';
import PlaceBetModal from '../../betting/components/PlaceBetModal';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import PageTransition from '../../common/components/PageTransition';
import './Layout.css';

const Layout = () => {
  const location = useLocation();
  const [isPlaceBetModalOpen, setIsPlaceBetModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [currentPath, setCurrentPath] = useState(location.pathname);

  // For handling scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // For updating currentPath on location change
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

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
          {/*PageTransition location={currentPath}>
              < Main Content */}
          <PageTransition location={currentPath}>
            <main className="main-content">
              <Outlet context={{ openPlaceBetModal }} />
            </main>
          </PageTransition>

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