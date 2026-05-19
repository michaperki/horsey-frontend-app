// src/features/game/pages/GamePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChessBoard from '../../chess/ChessBoard.jsx';
import ChessClock from '../../chess/ChessClock.jsx';
import { useSocket } from '../../common/contexts/SocketContext';
import { ChessProvider, useChess } from '../../chess/contexts/ChessContext';
import './GamePage.css';

// Inner component that uses the chess context
function GamePageContent() {
  const { gameId } = useParams();
  const { activeGame, joinGame, resignGame, offerDraw, loading, error } = useChess();
  const [clockRunning, setClockRunning] = useState(false);
  const [activeColor, setActiveColor] = useState('w');
  const [gameInfo, setGameInfo] = useState({
    whitePlayer: { name: 'White Player', rating: '1200', timeLeft: 600 },
    blackPlayer: { name: 'Black Player', rating: '1200', timeLeft: 600 },
    gameType: 'Rapid 10+0',
    status: 'active'
  });

  // Join the chess game when component mounts
  useEffect(() => {
    if (gameId) {
      joinGame(gameId);
    }
  }, [gameId, joinGame]);

  // Update local state when activeGame changes
  useEffect(() => {
    if (activeGame) {
      setGameInfo({
        whitePlayer: {
          name: activeGame.whitePlayer?.name || 'White Player',
          rating: activeGame.whitePlayer?.rating || '1200',
          timeLeft: activeGame.whiteTime || 600
        },
        blackPlayer: {
          name: activeGame.blackPlayer?.name || 'Black Player',
          rating: activeGame.blackPlayer?.rating || '1200',
          timeLeft: activeGame.blackTime || 600
        },
        gameType: `${Math.floor((activeGame.whiteTime || 600) / 60)}+${activeGame.increment || 0}`,
        status: activeGame.status || 'active'
      });
      setClockRunning(activeGame.status === 'ongoing');
      setActiveColor(activeGame.activeColor || 'w');
    }
  }, [activeGame]);

  // Handle resignation
  const handleResign = () => {
    if (gameId) {
      resignGame(gameId);
    }
  };

  // Handle draw offer
  const handleDrawOffer = () => {
    if (gameId) {
      offerDraw(gameId);
    }
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <h1 className="game-title">Chess Game</h1>
        <div className="game-id">Game ID: {gameId}</div>
        <div className="game-type">{gameInfo.gameType}</div>
      </div>

      {loading ? (
        <div className="loading">Loading game...</div>
      ) : error ? (
        <div className="error">Error: {error}</div>
      ) : (
        <>
          <div className="game-container">
            <div className="player-info black-player">
              <div className="player-name">{gameInfo.blackPlayer.name}</div>
              <div className="player-rating">{gameInfo.blackPlayer.rating}</div>
              <ChessClock
                timeLeft={gameInfo.blackPlayer.timeLeft}
                isRunning={clockRunning && activeColor === 'b'}
                isActive={activeColor === 'b'}
              />
            </div>

            <div className="board-wrapper">
              <ChessBoard
                gameId={gameId}
              />
            </div>

            <div className="player-info white-player">
              <div className="player-name">{gameInfo.whitePlayer.name}</div>
              <div className="player-rating">{gameInfo.whitePlayer.rating}</div>
              <ChessClock
                timeLeft={gameInfo.whitePlayer.timeLeft}
                isRunning={clockRunning && activeColor === 'w'}
                isActive={activeColor === 'w'}
              />
            </div>
          </div>

          <div className="game-controls">
            <button className="control-btn resign-btn" onClick={handleResign}>Resign</button>
            <button className="control-btn draw-btn" onClick={handleDrawOffer}>Offer Draw</button>
          </div>
        </>
      )}
    </div>
  );
}

// Wrapper component that provides the chess context
export default function GamePage() {
  return (
    <ChessProvider>
      <GamePageContent />
    </ChessProvider>
  );
}
