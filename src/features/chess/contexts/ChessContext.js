// src/features/chess/contexts/ChessContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSocket } from '../../common/contexts/SocketContext';
import { useAuth } from '../../auth/contexts/AuthContext';

// Create a context for chess-related state and functions
const ChessContext = createContext();

export const ChessProvider = ({ children }) => {
  const socket = useSocket();
  const { user } = useAuth();
  
  const [activeGame, setActiveGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Join a chess game
  const joinGame = useCallback((gameId) => {
    if (!socket) {
      setError('Socket connection unavailable');
      return;
    }
    
    setLoading(true);
    console.log('Joining chess game:', gameId);
    socket.emit('joinChessGame', { gameId });
    
    // Subscribe to socket events related to this game
    socket.on('gameState', (state) => {
      console.log('Received game state:', state);
      setActiveGame(state);
      setLoading(false);
    });
    
    socket.on('gameError', (err) => {
      console.error('Game error:', err);
      setError(err.message || 'An error occurred joining the game');
      setLoading(false);
    });
    
    return () => {
      socket.off('gameState');
      socket.off('gameError');
    };
  }, [socket]);

  // Create a new chess game
  const createGame = useCallback((options = {}) => {
    if (!socket) {
      setError('Socket connection unavailable');
      return;
    }
    
    const gameOptions = {
      timeControl: options.timeControl || 10, // 10 minutes
      increment: options.increment || 5,      // 5 seconds increment
      color: options.color || 'random',       // 'white', 'black', or 'random'
      ...options
    };
    
    setLoading(true);
    socket.emit('createChessGame', gameOptions);
    
    socket.once('gameCreated', (gameData) => {
      console.log('Game created:', gameData);
      setActiveGame(gameData);
      setLoading(false);
    });
    
    socket.once('gameError', (err) => {
      console.error('Error creating game:', err);
      setError(err.message || 'Failed to create game');
      setLoading(false);
    });
  }, [socket]);

  // Make a chess move
  const makeMove = useCallback((gameId, move) => {
    if (!socket || !gameId) {
      setError('Cannot make move - connection or game ID missing');
      return;
    }
    
    socket.emit('chessMove', { 
      gameId, 
      move
    });
  }, [socket]);

  // Resign from a game
  const resignGame = useCallback((gameId) => {
    if (!socket || !gameId || !activeGame) {
      setError('Cannot resign - connection or game data missing');
      return;
    }
    
    const color = activeGame.whitePlayer?.id === user?.id ? 'w' : 'b';
    socket.emit('resignGame', { gameId, color });
  }, [socket, activeGame, user]);

  // Offer a draw
  const offerDraw = useCallback((gameId) => {
    if (!socket || !gameId || !activeGame) {
      setError('Cannot offer draw - connection or game data missing');
      return;
    }
    
    const color = activeGame.whitePlayer?.id === user?.id ? 'w' : 'b';
    socket.emit('offerDraw', { gameId, color });
  }, [socket, activeGame, user]);

  // Respond to a draw offer
  const respondToDraw = useCallback((gameId, accepted) => {
    if (!socket || !gameId) {
      setError('Cannot respond to draw - connection or game ID missing');
      return;
    }
    
    socket.emit('respondToDraw', { gameId, accepted });
  }, [socket]);

  // Clear any error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <ChessContext.Provider
      value={{
        activeGame,
        gameHistory,
        loading,
        error,
        joinGame,
        createGame,
        makeMove,
        resignGame,
        offerDraw,
        respondToDraw,
        clearError
      }}
    >
      {children}
    </ChessContext.Provider>
  );
};

ChessProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useChess = () => useContext(ChessContext);

export default ChessContext;