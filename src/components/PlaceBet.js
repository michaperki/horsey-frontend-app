
// src/components/PlaceBet.js

import React, { useState } from "react";
import PlaceBetModal from "./PlaceBetModal";
import { useLichess } from '../contexts/LichessContext'; // Import Lichess context
import "./PlaceBet.css";

const PlaceBet = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { lichessConnected, triggerShake } = useLichess(); // Destructure from Lichess context

  const handleOpenModal = () => {
    if (!lichessConnected) {
      triggerShake();
      // Optionally, display a toast or notification
      return;
    }
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

      {isModalOpen && (
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

