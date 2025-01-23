
// frontend/src/components/NotificationsModal.js

import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
//import { useAuth } from '../contexts/AuthContext';

const NotificationsModal = () => {
  const socket = useSocket();
  // const { user } = useAuth(); // Ensure user information is available
  const [modalContent, setModalContent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Removed 'betCreated' event listener as it's now handled by PlaceBet component

    // Listen for 'betAccepted' event
    socket.on('betAccepted', (data) => {
      console.log('Received betAccepted event:', data); // Debugging
      setModalContent({
        title: 'Bet Accepted',
        message: data.message,
        gameLink: data.gameLink, // Ensure gameLink is part of the event data
      });
      setIsOpen(true);
    });

    return () => {
      // Removed socket.off('betCreated');
      socket.off('betAccepted');
    };
  }, [socket]);

  const handleClose = () => {
    setIsOpen(false);
    setModalContent(null);
  };

  if (!isOpen || !modalContent) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{modalContent.title}</h2>
        <p>{modalContent.message}</p>
        {modalContent.gameLink && (
          <div style={styles.linkContainer}>
            <a href={modalContent.gameLink} target="_blank" rel="noopener noreferrer" style={styles.link}>
              Go to Lichess Game
            </a>
          </div>
        )}
        <button onClick={handleClose} style={styles.closeButton}>
          Close
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    padding: '30px',
    borderRadius: '8px',
    maxWidth: '500px',
    textAlign: 'center',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  linkContainer: {
    marginTop: '15px',
  },
  link: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    borderRadius: '4px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  closeButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
};

export default NotificationsModal;

