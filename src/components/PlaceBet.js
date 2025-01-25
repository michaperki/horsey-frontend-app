
// src/components/PlaceBet.js

import React, { useState } from "react";
import PlaceBetModal from "./PlaceBetModal"; // Import the new PlaceBetModal
import "./PlaceBet.css"; // Ensure this CSS file includes styles for the button

const PlaceBet = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Button to Open Place Bet Modal */}
      <button className="place-bet-open-button" onClick={handleOpenModal}>
        Place a Bet
      </button>

      {/* PlaceBetModal Component */}
      <PlaceBetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        preSelectedVariant={null} // No pre-selected variant when opened from the button
      />
    </>
  );
};

export default PlaceBet;

