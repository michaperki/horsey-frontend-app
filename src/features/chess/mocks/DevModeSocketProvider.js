// src/features/chess/mocks/DevModeSocketProvider.js
import React, { createContext, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { Chess } from 'chess.js';

// Create a context for the mock socket
const DevModeSocketContext = createContext(null);

// Mock for real socket context
export const useDevModeSocket = () => useContext(DevModeSocketContext);

/**
 * Provider that creates a mock socket implementation for local development
 * This allows testing the chess board without requiring a real backend connection
 */
export const DevModeSocketProvider = ({ children }) => {
  // Holds our local chess game state
  const gameRef = useRef({
    gameId: null,
    game: new Chess(),
    whitePlayer: { id: 'white-player-id', name: 'Developer (White)' },
    blackPlayer: { id: 'black-player-id', name: 'Developer (Black)' },
    whiteTime: 600, // 10 minutes in seconds
    blackTime: 600,
    increment: 5,
    status: 'ongoing',
    activeColor: 'w',
    lastMoveTime: Date.now(),
  });

  // Track event listeners for simulating server events
  const listenersRef = useRef({});

  // Interval for clock ticks
  const clockIntervalRef = useRef(null);

  // Start the clock if not already running
  const startClock = () => {
    if (clockIntervalRef.current) return;

    clockIntervalRef.current = setInterval(() => {
      const gameData = gameRef.current;
      
      if (gameData.status === 'ongoing') {
        // Update time for active player
        if (gameData.game.turn() === 'w') {
          gameData.whiteTime = Math.max(0, gameData.whiteTime - 1);
          if (gameData.whiteTime <= 0) {
            handleTimeout('w');
            return;
          }
        } else {
          gameData.blackTime = Math.max(0, gameData.blackTime - 1);
          if (gameData.blackTime <= 0) {
            handleTimeout('b');
            return;
          }
        }

        // Emit clock update to listeners
        emitEvent('clockUpdate', {
          whiteTime: gameData.whiteTime,
          blackTime: gameData.blackTime,
          running: true,
          activeColor: gameData.game.turn()
        });
      }
    }, 1000);
  };

  // Stop the clock
  const stopClock = () => {
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
  };

  // Handle timeout when a player's clock reaches zero
  const handleTimeout = (color) => {
    stopClock();
    const gameData = gameRef.current;
    gameData.status = 'finished';
    const outcome = color === 'w' ? 'black' : 'white';

    emitEvent('gameOver', {
      outcome,
      reason: 'timeout',
      fen: gameData.game.fen(),
      pgn: gameData.game.pgn()
    });
    
    emitEvent('clockUpdate', {
      whiteTime: gameData.whiteTime,
      blackTime: gameData.blackTime,
      running: false,
      activeColor: gameData.game.turn()
    });
  };

  // Register an event listener
  const on = (event, callback) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = [];
    }
    listenersRef.current[event].push(callback);
  };

  // Remove an event listener
  const off = (event, callback) => {
    if (!listenersRef.current[event]) return;
    
    if (callback) {
      listenersRef.current[event] = listenersRef.current[event].filter(
        cb => cb !== callback
      );
    } else {
      listenersRef.current[event] = [];
    }
  };

  // Emit an event to all registered listeners
  const emitEvent = (event, data) => {
    if (!listenersRef.current[event]) return;
    
    listenersRef.current[event].forEach(callback => {
      callback(data);
    });
  };

  // Handle emitted events from components
  const emit = (event, data) => {
    console.log(`[DevMode] Received event: ${event}`, data);
    
    switch (event) {
      case 'joinChessGame':
        // Store the game ID for future reference 
        if (data && data.gameId) {
          console.log(`[DevMode] Joining game: ${data.gameId}`);
          
          // If we don't have a gameId set yet, or if this is a different game ID,
          // initialize a new game with this ID
          if (!gameRef.current.gameId || gameRef.current.gameId !== data.gameId) {
            resetGame({
              gameId: data.gameId
            });
            return;
          }
        }
        handleJoinGame(data);
        break;
        
      case 'createChessGame':
        // Generate a unique game ID if one isn't provided
        const gameId = data.gameId || `dev-game-${Date.now()}`;
        console.log(`[DevMode] Creating new game: ${gameId}`);
        
        resetGame({
          gameId,
          timeControl: data.timeControl || 10,
          increment: data.increment || 5
        });
        
        // Emit gameCreated event with the new game ID
        setTimeout(() => {
          emitEvent('gameCreated', { 
            gameId,
            whitePlayer: gameRef.current.whitePlayer,
            blackPlayer: gameRef.current.blackPlayer,
            timeControl: data.timeControl || 10,
            increment: data.increment || 5
          });
        }, 100);
        break;
        
      case 'chessMove':
        // Make sure we're operating on the right game
        if (data.gameId && data.gameId !== gameRef.current.gameId) {
          emitEvent('gameError', { message: 'Game not found' });
          return;
        }
        handleChessMove(data);
        break;
        
      case 'resignGame':
        // Make sure we're operating on the right game
        if (data.gameId && data.gameId !== gameRef.current.gameId) {
          emitEvent('gameError', { message: 'Game not found' });
          return;
        }
        handleResignGame(data);
        break;
        
      case 'offerDraw':
        // Make sure we're operating on the right game
        if (data.gameId && data.gameId !== gameRef.current.gameId) {
          emitEvent('gameError', { message: 'Game not found' });
          return;
        }
        handleDrawOffer(data);
        break;
        
      case 'respondToDraw':
        // Make sure we're operating on the right game
        if (data.gameId && data.gameId !== gameRef.current.gameId) {
          emitEvent('gameError', { message: 'Game not found' });
          return;
        }
        handleRespondToDraw(data);
        break;
        
      default:
        console.log(`[DevMode] Unhandled event: ${event}`, data);
    }
  };

  // Handle a player joining the game
  const handleJoinGame = (data) => {
    const gameData = gameRef.current;
    
    // Store the game ID if provided
    if (data && data.gameId) {
      // If this is a new game ID and we have an existing game ID that's different,
      // check if we should respond with a "game not found" error
      if (gameData.gameId && gameData.gameId !== data.gameId) {
        console.log(`[DevMode] Game ID mismatch: ${data.gameId} vs ${gameData.gameId}`);
        // If in dev mode, we'll accept any game ID and reset the current game
        gameData.gameId = data.gameId;
      } else if (!gameData.gameId) {
        // First time setting the game ID
        gameData.gameId = data.gameId;
      }
    }
    
    // Emit game state to the joining player
    emitEvent('gameState', {
      gameId: gameData.gameId,
      fen: gameData.game.fen(),
      pgn: gameData.game.pgn(),
      whitePlayer: gameData.whitePlayer,
      blackPlayer: gameData.blackPlayer,
      whiteTime: gameData.whiteTime,
      blackTime: gameData.blackTime,
      increment: gameData.increment,
      activeColor: gameData.game.turn(),
      status: 'ongoing' // Always set status to 'ongoing' to ensure the board renders
    });
    
    // Start the clock if game is ongoing
    if (gameData.status === 'ongoing') {
      startClock();
    }
    
    // Emit clock update
    emitEvent('clockUpdate', {
      whiteTime: gameData.whiteTime,
      blackTime: gameData.blackTime,
      running: gameData.status === 'ongoing',
      activeColor: gameData.game.turn()
    });
  };

  // Handle a chess move
  const handleChessMove = ({ move }) => {
    const gameData = gameRef.current;
    
    // Don't allow moves if game is not ongoing
    if (gameData.status !== 'ongoing') {
      emitEvent('gameError', { message: 'Game is not active' });
      return;
    }
    
    try {
      // Try to make the move
      const result = gameData.game.move(move);
      if (!result) {
        emitEvent('gameError', { message: 'Invalid move' });
        return;
      }
      
      // Update timers and add increment
      const now = Date.now();
      const moveTime = now - gameData.lastMoveTime;
      gameData.lastMoveTime = now;
      
      if (result.color === 'w') {
        gameData.whiteTime = Math.max(0, gameData.whiteTime - moveTime / 1000) + gameData.increment;
      } else {
        gameData.blackTime = Math.max(0, gameData.blackTime - moveTime / 1000) + gameData.increment;
      }
      
      // Check for game over conditions
      if (gameData.game.isGameOver()) {
        gameData.status = 'finished';
        stopClock();
        
        let outcome = null;
        if (gameData.game.isCheckmate()) {
          outcome = gameData.game.turn() === 'w' ? 'black' : 'white';
        } else if (gameData.game.isDraw()) {
          outcome = 'draw';
        }
        
        // Emit move update
        emitEvent('chessMoved', {
          move: result,
          fen: gameData.game.fen(),
          pgn: gameData.game.pgn(),
          whiteTime: gameData.whiteTime,
          blackTime: gameData.blackTime,
          status: gameData.status,
          outcome
        });
        
        // Emit game over
        emitEvent('gameOver', {
          outcome,
          reason: gameData.game.isCheckmate() ? 'checkmate' : 'draw',
          fen: gameData.game.fen(),
          pgn: gameData.game.pgn()
        });
      } else {
        // Emit move update
        emitEvent('chessMoved', {
          move: result,
          fen: gameData.game.fen(),
          pgn: gameData.game.pgn(),
          whiteTime: gameData.whiteTime,
          blackTime: gameData.blackTime,
          status: gameData.status
        });
      }
      
      // Emit clock update
      emitEvent('clockUpdate', {
        whiteTime: gameData.whiteTime,
        blackTime: gameData.blackTime,
        running: gameData.status === 'ongoing',
        activeColor: gameData.game.turn()
      });
    } catch (error) {
      console.error('[DevMode] Error making move:', error);
      emitEvent('gameError', { message: 'Error making move: ' + error.message });
    }
  };

  // Handle resignation
  const handleResignGame = ({ color }) => {
    const gameData = gameRef.current;
    stopClock();
    gameData.status = 'finished';
    const outcome = color === 'w' ? 'black' : 'white';
    
    // Emit game over
    emitEvent('gameOver', {
      outcome,
      reason: 'resignation',
      fen: gameData.game.fen(),
      pgn: gameData.game.pgn()
    });
    
    // Emit clock update
    emitEvent('clockUpdate', {
      whiteTime: gameData.whiteTime,
      blackTime: gameData.blackTime,
      running: false,
      activeColor: gameData.game.turn()
    });
  };

  // Handle draw offer
  const handleDrawOffer = ({ color }) => {
    // In dev mode, automatically accept draw offers after 2 seconds
    emitEvent('drawOffered', { color });
    
    setTimeout(() => {
      emitEvent('drawDeclined');
      // To test accept logic: emitDraw('gameOver', { outcome: 'draw', reason: 'agreement' });
    }, 2000);
  };

  // Handle response to draw offer
  const handleRespondToDraw = ({ accepted }) => {
    const gameData = gameRef.current;
    
    if (accepted) {
      stopClock();
      gameData.status = 'finished';
      
      // Emit game over
      emitEvent('gameOver', {
        outcome: 'draw',
        reason: 'agreement',
        fen: gameData.game.fen(),
        pgn: gameData.game.pgn()
      });
      
      // Emit clock update
      emitEvent('clockUpdate', {
        whiteTime: gameData.whiteTime,
        blackTime: gameData.blackTime,
        running: false,
        activeColor: gameData.game.turn()
      });
    } else {
      emitEvent('drawDeclined');
    }
  };

  // Reset the game state
  const resetGame = (options = {}) => {
    stopClock();
    
    gameRef.current = {
      gameId: options.gameId || gameRef.current.gameId || `dev-game-${Date.now()}`,
      game: new Chess(),
      whitePlayer: options.whitePlayer || { id: 'white-player-id', name: 'Developer (White)' },
      blackPlayer: options.blackPlayer || { id: 'black-player-id', name: 'Developer (Black)' },
      whiteTime: options.timeControl ? options.timeControl * 60 : 600,
      blackTime: options.timeControl ? options.timeControl * 60 : 600,
      increment: options.increment || 5,
      status: 'ongoing',
      activeColor: 'w',
      lastMoveTime: Date.now()
    };
    
    console.log(`[DevMode] Game reset with ID: ${gameRef.current.gameId}`);
    
    // Pass the game ID when joining
    handleJoinGame({ gameId: gameRef.current.gameId });
  };

  // Create the mock socket interface
  const mockSocket = {
    on,
    off,
    emit,
    connect: () => console.log('[DevMode] Connect called'),
    disconnect: () => {
      stopClock();
      console.log('[DevMode] Disconnect called');
    },
    id: 'dev-mode-socket-id',
    // Dev-only methods for controlling the game state
    _dev: {
      resetGame,
      getGameState: () => ({ ...gameRef.current }),
      setPosition: (fen) => {
        try {
          gameRef.current.game = new Chess(fen);
          handleJoinGame();
          return true;
        } catch (e) {
          console.error('[DevMode] Invalid FEN:', e);
          return false;
        }
      },
      togglePlayerColor: () => {
        const temp = gameRef.current.whitePlayer;
        gameRef.current.whitePlayer = gameRef.current.blackPlayer;
        gameRef.current.blackPlayer = temp;
        handleJoinGame();
      }
    }
  };

  return (
    <DevModeSocketContext.Provider value={mockSocket}>
      {typeof children === 'function' ? children(mockSocket) : children}
    </DevModeSocketContext.Provider>
  );
};

DevModeSocketProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.func
  ]).isRequired,
};

export default DevModeSocketContext;