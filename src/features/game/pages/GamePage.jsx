// src/features/game/pages/GamePage.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChessBoard from '../../chess/ChessBoard.jsx';
import ChessClock from '../../chess/ChessClock.jsx';
import { useSocket } from '../../common/contexts/SocketContext';
import './GamePage.css';

export default function GamePage() {
  const { gameId } = useParams();
  const socket = useSocket();
  const [gameInfo, setGameInfo] = useState({
    whitePlayer: { name: 'White Player', rating: '1200', timeLeft: 600 },
    blackPlayer: { name: 'Black Player', rating: '1200', timeLeft: 600 },
    gameType: 'Rapid 10+0',
    status: 'active'
  });
  const [clockRunning, setClockRunning] = useState(false);
  const [activeColor, setActiveColor] = useState('w');

  useEffect(() => {
    if (!socket || !gameId) return;

    console.log('Emitting joinChessGame from GamePage:', gameId);
    socket.emit('joinChessGame', { gameId });

    // You may keep or remove getGameInfo depending on whether it's still used
    // socket.emit('getGameInfo', { gameId });

    // Request game information when component mounts
    console.log('Emitting joinChessGame with gameId:', gameId);
    socket.emit('joinChessGame', { gameId });

    // Listen for game info updates
    socket.on('gameInfo', (data) => {
      console.log('Game info received:', data);
      setGameInfo(data);
    });

    // Listen for clock updates
    socket.on('clockUpdate', (data) => {
      console.log('Clock update received:', data);
      setGameInfo(prevInfo => ({
        ...prevInfo,
        whitePlayer: { ...prevInfo.whitePlayer, timeLeft: data.whiteTime },
        blackPlayer: { ...prevInfo.blackPlayer, timeLeft: data.blackTime }
      }));
      setClockRunning(data.running);
      setActiveColor(data.activeColor);
    });

    return () => {
      socket.off('gameInfo');
      socket.off('clockUpdate');
    };
  }, [socket, gameId]);

  // Handle move - this function will be passed to the ChessBoard component
  const handleMove = (move) => {
    // Update clocks or other game state if needed
    console.log('Move made:', move);
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <h1 className="game-title">Chess Game</h1>
        <div className="game-id">Game ID: {gameId}</div>
        <div className="game-type">{gameInfo.gameType}</div>
      </div>

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
        <button className="control-btn resign-btn">Resign</button>
        <button className="control-btn draw-btn">Offer Draw</button>
      </div>
    </div>
  );
}
