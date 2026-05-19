// src/features/game/pages/ChessGamePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../common/contexts/SocketContext';
import { useAuth } from '../../auth/contexts/AuthContext';
import OnlineChessboard from '../../chess/components/OnlineChessboard';
import StandaloneChessboard from '../../chess/components/StandaloneChessboard';
import './ChessGamePage.css';

const ChessGamePage = () => {
  const { gameId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Determine if we should use offline mode (no socket connection)
  useEffect(() => {
    if (!socket && gameId) {
      console.log('No socket connection available, falling back to offline mode');
      setIsOfflineMode(true);
      setLoading(false);
    }
  }, [socket, gameId]);
  
  // Join the game when the socket is available
  useEffect(() => {
    if (socket && gameId && !isOfflineMode) {
      // First clean up any existing listeners
      const cleanupListeners = () => {
        socket.off('gameState');
        socket.off('gameError');
        socket.off('gameNotFound');
      };
      
      // Set up game listeners
      socket.on('gameState', (state) => {
        setGameState(state);
        setLoading(false);
      });
      
      socket.on('gameError', (err) => {
        console.error('Game error:', err);
        setError(err.message || 'An error occurred with the game');
        setLoading(false);
      });
      
      socket.on('gameNotFound', () => {
        setError('Game not found. It may have been deleted or never existed.');
        setLoading(false);
      });
      
      // Join the game
      console.log('Joining chess game:', gameId);
      socket.emit('joinChessGame', { gameId });
      
      // Cleanup when unmounting
      return cleanupListeners;
    }
  }, [socket, gameId, isOfflineMode]);
  
  // Handle game over
  const handleGameOver = useCallback((result) => {
    console.log('Game over:', result);
    // You could display a notification, update user stats, etc.
  }, []);
  
  // Handle errors from the chess component
  const handleChessError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);
  
  // Handle game state changes
  const handleGameStateChange = useCallback((newState) => {
    setGameState(newState);
  }, []);
  
  // Handle going back to lobby
  const handleBackToLobby = useCallback(() => {
    navigate('/lobby');
  }, [navigate]);
  
  // Handle starting a new game
  const handleNewGame = useCallback(() => {
    navigate('/lobby');
  }, [navigate]);
  
  // Loading state
  if (loading) {
    return (
      <div className="game-page loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading chess game...</div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="game-page error-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <div className="error-actions">
          <button onClick={handleBackToLobby}>Back to Lobby</button>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="game-page">
      <div className="game-header">
        <h1 className="game-title">Chess Game</h1>
        {gameId && <div className="game-id">Game ID: {gameId}</div>}
        {gameState && gameState.timeControl && (
          <div className="game-type">
            {Math.floor(gameState.timeControl / 60)}+{gameState.increment}
          </div>
        )}
      </div>
      
      <div className="game-container">
        {isOfflineMode ? (
          // If offline mode, use standalone chessboard
          <StandaloneChessboard />
        ) : (
          // If online mode, use online chessboard
          <OnlineChessboard
            gameId={gameId}
            onGameStateChange={handleGameStateChange}
            onGameOver={handleGameOver}
            onError={handleChessError}
          />
        )}
      </div>
      
      <div className="game-footer">
        <button onClick={handleBackToLobby} className="secondary-button">
          Back to Lobby
        </button>
        {gameState && gameState.status === 'finished' && (
          <button onClick={handleNewGame} className="primary-button">
            New Game
          </button>
        )}
      </div>
    </div>
  );
};

export default ChessGamePage;