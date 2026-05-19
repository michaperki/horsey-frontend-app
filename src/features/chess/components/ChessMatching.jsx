// src/features/chess/components/ChessMatching.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../common/contexts/SocketContext';
import { useAuth } from '../../auth/contexts/AuthContext';
import '../styles/ChessMatching.css';

const ChessMatching = () => {
  const socket = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [availableGames, setAvailableGames] = useState([]);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isFindingGame, setIsFindingGame] = useState(false);
  const [error, setError] = useState(null);
  const [timeControl, setTimeControl] = useState(10);
  const [increment, setIncrement] = useState(5);
  const [color, setColor] = useState('random');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Initial load of available games
  useEffect(() => {
    if (socket) {
      // Request available games
      socket.emit('getAvailableChessGames');
      
      // Listen for game listings
      socket.on('availableChessGames', handleAvailableGames);
      
      // Listen for game creation success
      socket.on('gameCreated', handleGameCreated);
      
      // Listen for errors
      socket.on('gameError', handleGameError);
      
      // Listen for finding game status
      socket.on('findGameStatus', handleFindGameStatus);
      
      // Clean up on unmount
      return () => {
        socket.off('availableChessGames');
        socket.off('gameCreated');
        socket.off('gameError');
        socket.off('findGameStatus');
      };
    }
  }, [socket]);
  
  // Update available games when we receive them
  const handleAvailableGames = useCallback((games) => {
    setAvailableGames(games);
  }, []);
  
  // Handle successful game creation
  const handleGameCreated = useCallback((gameData) => {
    setIsCreatingGame(false);
    
    // Navigate to the game page
    if (gameData && gameData.id) {
      navigate(`/chess/game/${gameData.id}`);
    }
  }, [navigate]);
  
  // Handle errors
  const handleGameError = useCallback((err) => {
    setError(err.message || 'An error occurred');
    setIsCreatingGame(false);
    setIsFindingGame(false);
  }, []);
  
  // Handle finding game status updates
  const handleFindGameStatus = useCallback((status) => {
    if (status.gameId) {
      setIsFindingGame(false);
      navigate(`/chess/game/${status.gameId}`);
    } else if (status.message) {
      setError(status.message);
      setIsFindingGame(false);
    }
  }, [navigate]);
  
  // Create a new game
  const handleCreateGame = useCallback((e) => {
    e.preventDefault();
    
    if (!socket) {
      setError('No connection available');
      return;
    }
    
    setIsCreatingGame(true);
    setError(null);
    
    socket.emit('createChessGame', {
      timeControl: parseInt(timeControl),
      increment: parseInt(increment),
      color
    });
  }, [socket, timeControl, increment, color]);
  
  // Join an existing game
  const handleJoinGame = useCallback((gameId) => {
    if (!socket) {
      setError('No connection available');
      return;
    }
    
    navigate(`/chess/game/${gameId}`);
  }, [socket, navigate]);
  
  // Find a random game
  const handleFindGame = useCallback(() => {
    if (!socket) {
      setError('No connection available');
      return;
    }
    
    setIsFindingGame(true);
    setError(null);
    
    socket.emit('findChessGame', {
      timeControl: parseInt(timeControl),
      increment: parseInt(increment)
    });
  }, [socket, timeControl, increment]);
  
  // Cancel finding a game
  const handleCancelFind = useCallback(() => {
    if (socket) {
      socket.emit('cancelFindChessGame');
    }
    
    setIsFindingGame(false);
  }, [socket]);
  
  // Toggle the create game form
  const toggleCreateForm = useCallback(() => {
    setShowCreateForm(prev => !prev);
  }, []);
  
  // Format time control for display
  const formatTimeControl = useCallback((minutes, incrementSeconds) => {
    return `${minutes}+${incrementSeconds}`;
  }, []);
  
  return (
    <div className="chess-matching">
      <div className="chess-matching-header">
        <h2 className="chess-matching-title">Chess Matches</h2>
        <div className="chess-matching-actions">
          <button 
            className="btn-find-game" 
            onClick={handleFindGame}
            disabled={isFindingGame || isCreatingGame}
          >
            {isFindingGame ? 'Finding Game...' : 'Find Game'}
          </button>
          
          <button 
            className="btn-create-game" 
            onClick={toggleCreateForm}
            disabled={isFindingGame || isCreatingGame}
          >
            {showCreateForm ? 'Cancel' : 'Create Game'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="chess-matching-error">
          {error}
          <button className="btn-dismiss" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {isFindingGame && (
        <div className="chess-finding-game">
          <div className="finding-game-animation">
            <div className="dot-pulse"></div>
          </div>
          <p>Finding a {formatTimeControl(timeControl, increment)} chess game...</p>
          <button className="btn-cancel-find" onClick={handleCancelFind}>
            Cancel
          </button>
        </div>
      )}
      
      {showCreateForm && (
        <div className="chess-create-form">
          <form onSubmit={handleCreateGame}>
            <div className="form-group">
              <label htmlFor="timeControl">Time (minutes)</label>
              <select 
                id="timeControl" 
                value={timeControl} 
                onChange={(e) => setTimeControl(e.target.value)}
                disabled={isCreatingGame}
              >
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="30">30</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="increment">Increment (seconds)</label>
              <select 
                id="increment" 
                value={increment} 
                onChange={(e) => setIncrement(e.target.value)}
                disabled={isCreatingGame}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="color">Play as</label>
              <select 
                id="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                disabled={isCreatingGame}
              >
                <option value="random">Random</option>
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-submit-create" 
                disabled={isCreatingGame}
              >
                {isCreatingGame ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="available-games">
        <h3 className="available-games-title">
          Available Games {availableGames.length > 0 ? `(${availableGames.length})` : ''}
        </h3>
        
        {availableGames.length > 0 ? (
          <div className="games-list">
            {availableGames.map(game => (
              <div key={game.id} className="game-item">
                <div className="game-info">
                  <div className="game-creator">
                    <span className="creator-name">{game.creator.name}</span>
                    <span className="creator-rating">{game.creator.rating || '?'}</span>
                  </div>
                  <div className="game-time-control">
                    {formatTimeControl(game.timeControl, game.increment)}
                  </div>
                  <div className="game-color">
                    {game.creatorColor === 'w' ? 'vs White' : 
                     game.creatorColor === 'b' ? 'vs Black' : 
                     'vs Random'}
                  </div>
                </div>
                <button 
                  className="btn-join-game" 
                  onClick={() => handleJoinGame(game.id)}
                  disabled={isCreatingGame || isFindingGame}
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-games">
            <p>No games available at the moment.</p>
            <p>Create a new game or find a match!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChessMatching;