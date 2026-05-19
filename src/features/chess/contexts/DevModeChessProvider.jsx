// DevModeChessProvider.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create context
const DevModeChessContext = createContext();

// Configuration for development mode
const devConfig = {
  // Enable dev mode for standalone testing - default to false in production
  enabled: process.env.NODE_ENV === 'development' && process.env.REACT_APP_CHESS_DEV_MODE !== 'false',
  
  // Auto-play moves for testing
  autoPlay: false,
  
  // Auto-play interval in milliseconds
  autoPlayInterval: 1000,
  
  // Auto-play delay before starting
  autoPlayDelay: 2000,
  
  // Debug logging - disable in production
  debug: process.env.NODE_ENV === 'development'
};

// Provider component
export const DevModeChessProvider = ({ children }) => {
  const [isDevMode, setIsDevMode] = useState(devConfig.enabled);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState(null);
  
  // Log debug messages
  const debugLog = useCallback((...args) => {
    if (devConfig.debug && isDevMode) {
      console.log('%c[DevChess]', 'background:#f39c12;color:white;padding:2px 5px;border-radius:3px', ...args);
    }
  }, [isDevMode]);
  
  // Toggle development mode
  const toggleDevMode = useCallback(() => {
    setIsDevMode(prev => !prev);
    debugLog('Dev mode:', !isDevMode);
  }, [isDevMode, debugLog]);
  
  // Generate a random valid move
  const generateRandomMove = useCallback((chessEngine) => {
    if (!chessEngine) return null;
    
    // Get all valid moves across the board
    const allMoves = [];
    const { board, currentPlayer } = chessEngine.getGameState();
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        const isPieceOfCurrentPlayer = 
          (currentPlayer === 'w' && piece === piece.toUpperCase() && piece !== ' ') || 
          (currentPlayer === 'b' && piece === piece.toLowerCase() && piece !== ' ');
        
        if (isPieceOfCurrentPlayer) {
          const moves = chessEngine.getValidMoves(row, col);
          moves.forEach(move => {
            allMoves.push({
              from: { row, col },
              to: move
            });
          });
        }
      }
    }
    
    if (allMoves.length === 0) return null;
    
    // Return a random move
    const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
    return randomMove;
  }, []);
  
  // Start auto-playing moves
  const startAutoPlay = useCallback((chessEngine) => {
    if (!chessEngine || autoPlaying) return;
    
    setAutoPlaying(true);
    debugLog('Starting auto-play');
    
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        const randomMove = generateRandomMove(chessEngine);
        if (randomMove) {
          debugLog('Auto-playing move:', randomMove);
          chessEngine.movePiece(
            randomMove.from.row,
            randomMove.from.col,
            randomMove.to.row,
            randomMove.to.col
          );
        } else {
          debugLog('No valid moves, stopping auto-play');
          clearInterval(interval);
          setAutoPlaying(false);
        }
      }, devConfig.autoPlayInterval);
      
      setAutoPlayTimer(interval);
    }, devConfig.autoPlayDelay);
    
    // Store the timer to clear it later
    setAutoPlayTimer(timer);
  }, [autoPlaying, generateRandomMove, debugLog]);
  
  // Stop auto-playing moves
  const stopAutoPlay = useCallback(() => {
    if (!autoPlaying) return;
    
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      clearTimeout(autoPlayTimer);
    }
    
    setAutoPlaying(false);
    setAutoPlayTimer(null);
    debugLog('Stopped auto-play');
  }, [autoPlaying, autoPlayTimer, debugLog]);
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        clearTimeout(autoPlayTimer);
      }
    };
  }, [autoPlayTimer]);
  
  // Expose the context value
  const contextValue = {
    isDevMode,
    toggleDevMode,
    autoPlaying,
    startAutoPlay,
    stopAutoPlay,
    devConfig,
    debugLog
  };
  
  return (
    <DevModeChessContext.Provider value={contextValue}>
      {children}
    </DevModeChessContext.Provider>
  );
};

// Custom hook to use the context
export const useDevModeChess = () => {
  const context = useContext(DevModeChessContext);
  if (!context) {
    throw new Error('useDevModeChess must be used within a DevModeChessProvider');
  }
  return context;
};

export default DevModeChessProvider;