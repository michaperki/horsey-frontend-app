// src/features/chess/components/BetChessGame.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBet } from '../../betting/contexts/BetContext';
import { useAuth } from '../../auth/contexts/AuthContext';
import { useSocket } from '../../common/contexts/SocketContext';
import OnlineChessboard from './OnlineChessboard';
import '../styles/BetChessGame.css';

const BetChessGame = () => {
  const { gameId } = useParams();
  const { currentBet, fetchBet, clearBet } = useBet();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch bet data if we don't have it
  useEffect(() => {
    // Check if this game has an associated bet
    if (socket && gameId) {
      socket.emit('getBetForGame', { gameId });
    }
  }, [socket, gameId]);

  // Listen for game-bet association
  useEffect(() => {
    if (!socket) return;

    const handleBetInfo = (data) => {
      if (data.betId) {
        fetchBet(data.betId);
      }
    };

    socket.on('betInfo', handleBetInfo);

    return () => {
      socket.off('betInfo', handleBetInfo);
    };
  }, [socket, fetchBet]);

  // Determine player color based on bet data
  useEffect(() => {
    if (currentBet && user) {
      if (currentBet.finalWhiteId === user.id) {
        setPlayerColor('white');
      } else if (currentBet.finalBlackId === user.id) {
        setPlayerColor('black');
      }
    }
  }, [currentBet, user]);

  // Handle game over
  const handleGameOver = (data) => {
    setGameOver(true);
    setGameResult(data);
  };

  // Handle errors
  const handleError = (errorMessage) => {
    setError(errorMessage);
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      clearBet();
    };
  }, [clearBet]);

  // Return to lobby
  const handleReturnToLobby = () => {
    navigate('/lobby');
  };

  if (error) {
    return (
      <div className="bet-chess-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={handleReturnToLobby}>Return to Lobby</button>
      </div>
    );
  }

  return (
    <div className="bet-chess-game">
      {currentBet && (
        <div className="bet-info">
          <div className="bet-details">
            <h2>Chess Match with Bet</h2>
            <div className="bet-amount">
              <span>Bet Amount:</span> {currentBet.amount} {currentBet.currencyType === 'token' ? 'PTK' : 'SWP'}
            </div>
            <div className="bet-status">
              <span>Status:</span> {currentBet.status}
            </div>
          </div>
          {gameOver && gameResult && (
            <div className="game-result">
              <h3>Game Result: {gameResult.outcome}</h3>
              <p>Reason: {gameResult.reason}</p>
              {currentBet.status === 'won' && (
                <div className="winnings">
                  <span>Your winnings:</span> {currentBet.winnings || currentBet.amount * 2} {currentBet.currencyType === 'token' ? 'PTK' : 'SWP'}
                </div>
              )}
              <button onClick={handleReturnToLobby}>Return to Lobby</button>
            </div>
          )}
        </div>
      )}

      <OnlineChessboard
        gameId={gameId}
        orientation={playerColor || 'white'}
        onGameOver={handleGameOver}
        onError={handleError}
      />
    </div>
  );
};

export default BetChessGame;