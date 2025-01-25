
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
      <button className="place-bet-open-button" onClick={handleOpenModal}>
        Place a Bet
      </button>

      {isModalOpen && ( // Conditionally render PlaceBetModal
        <PlaceBetModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          preSelectedVariant={null}
        />
      )}
    </>
  );
};

export default PlaceBet;

