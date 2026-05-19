// src/features/chess/pages/SimpleChessPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import '../ChessBoard.css';

// A simplified chess page that doesn't depend on any other components
const SimpleChessPage = () => {
  // Game state
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('');
  const [orientation, setOrientation] = useState('white');
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [timeControl, setTimeControl] = useState(10); // 10 minutes
  const [increment, setIncrement] = useState(5); // 5 second increment
  
  // Clock state
  const [whiteTime, setWhiteTime] = useState(10 * 60); // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(10 * 60);
  const [clockRunning, setClockRunning] = useState(false);
  const clockIntervalRef = useRef(null);
  const lastMoveTimeRef = useRef(Date.now());
  
  // Game status
  const [status, setStatus] = useState('ongoing');
  const [outcome, setOutcome] = useState('');
  
  // Initialize the game
  useEffect(() => {
    const chess = new Chess();
    setGame(chess);
    setFen(chess.fen());
    
    // Cleanup function to clear the clock interval
    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
      }
    };
  }, []);
  
  // Format seconds to mm:ss display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start the clock
  const startClock = () => {
    if (clockIntervalRef.current) return;
    
    setClockRunning(true);
    lastMoveTimeRef.current = Date.now();
    
    clockIntervalRef.current = setInterval(() => {
      const currentPlayer = game.turn();
      
      if (currentPlayer === 'w') {
        setWhiteTime(prevTime => {
          if (prevTime <= 0) {
            handleTimeout('w');
            return 0;
          }
          return prevTime - 1;
        });
      } else {
        setBlackTime(prevTime => {
          if (prevTime <= 0) {
            handleTimeout('b');
            return 0;
          }
          return prevTime - 1;
        });
      }
    }, 1000);
  };
  
  // Stop the clock
  const stopClock = () => {
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
      setClockRunning(false);
    }
  };
  
  // Handle timeout (player's clock reached zero)
  const handleTimeout = (color) => {
    stopClock();
    setStatus('finished');
    setOutcome(color === 'w' ? 'black' : 'white');
  };
  
  // Get possible moves for a square
  const getMoveOptions = (square) => {
    const moves = game.moves({
      square,
      verbose: true
    });
    
    const newSquares = {};
    
    // Add highlighted square for the piece being moved
    if (moves.length > 0) {
      newSquares[square] = {
        background: 'rgba(255, 255, 0, 0.4)'
      };
      
      // Add highlighted squares for possible move destinations
      moves.forEach((move) => {
        newSquares[move.to] = {
          background:
            game.get(move.to) && game.get(move.to).color !== game.get(square).color
              ? 'rgba(255, 0, 0, 0.4)'
              : 'rgba(0, 255, 0, 0.4)'
        };
      });
    }
    
    return newSquares;
  };
  
  // Handle piece movement
  const onSquareClick = (square) => {
    // Don't allow moves if the game is over
    if (status !== 'ongoing') {
      return;
    }
    
    // Check if we already have a piece selected
    if (moveFrom === '') {
      // No piece selected yet - select the piece if it belongs to the current player
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setMoveFrom(square);
        setOptionSquares(getMoveOptions(square));
      }
    } else {
      // We already have a piece selected, try to make a move
      const moves = game.moves({
        square: moveFrom,
        verbose: true
      });
      
      // Check if the destination square is a valid move
      const move = moves.find(
        (m) => m.from === moveFrom && m.to === square
      );
      
      if (move) {
        // If it's a valid move, make it
        try {
          // Create a new game instance with the current position
          const newGame = new Chess(game.fen());
          
          // Make the move
          const result = newGame.move({
            from: moveFrom,
            to: square,
            promotion: move.promotion || 'q' // Default to queen for simplicity
          });
          
          // Update game state
          setGame(newGame);
          setFen(newGame.fen());
          
          // Add increment to the player who just moved
          const now = Date.now();
          const moveTime = (now - lastMoveTimeRef.current) / 1000;
          lastMoveTimeRef.current = now;
          
          if (result.color === 'w') {
            setWhiteTime(prevTime => prevTime + increment);
          } else {
            setBlackTime(prevTime => prevTime + increment);
          }
          
          // Start the clock if not already running
          if (!clockRunning) {
            startClock();
          }
          
          // Check for game over conditions
          if (newGame.isGameOver()) {
            stopClock();
            setStatus('finished');
            
            if (newGame.isCheckmate()) {
              setOutcome(newGame.turn() === 'w' ? 'black' : 'white');
            } else if (newGame.isDraw()) {
              setOutcome('draw');
            }
          }
          
          // Clear selection
          setMoveFrom('');
          setOptionSquares({});
        } catch (e) {
          console.error('Error making move:', e);
          // If the move fails, keep the same piece selected
          setOptionSquares(getMoveOptions(moveFrom));
        }
      } else {
        // If it's not a valid move, check if we're selecting a new piece
        const piece = game.get(square);
        if (piece && piece.color === game.turn()) {
          setMoveFrom(square);
          setOptionSquares(getMoveOptions(square));
        } else {
          // If we're clicking on an empty square, clear the selection
          setMoveFrom('');
          setOptionSquares({});
        }
      }
    }
  };
  
  // Reset the game
  const handleReset = () => {
    stopClock();
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveFrom('');
    setOptionSquares({});
    setWhiteTime(timeControl * 60);
    setBlackTime(timeControl * 60);
    setStatus('ongoing');
    setOutcome('');
    lastMoveTimeRef.current = Date.now();
  };
  
  // Switch sides
  const handleSwitchSides = () => {
    setOrientation(prev => prev === 'white' ? 'black' : 'white');
  };
  
  return (
    <div className="chess-page">
      <h1>Chess</h1>
      
      <div className="chess-controls">
        <div className="time-controls">
          <label>
            Time (minutes):
            <select 
              value={timeControl} 
              onChange={(e) => setTimeControl(parseInt(e.target.value))}
            >
              <option value={1}>1</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
            </select>
          </label>
          
          <label>
            Increment (seconds):
            <select 
              value={increment} 
              onChange={(e) => setIncrement(parseInt(e.target.value))}
            >
              <option value={0}>0</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </label>
        </div>
        
        <div className="game-buttons">
          <button onClick={handleReset}>Reset Game</button>
          <button onClick={handleSwitchSides}>Switch Sides</button>
        </div>
      </div>
      
      <div className="chess-board-container">
        <div className="player-info black">
          <div className="player-name">Black</div>
          <div className={`player-clock ${game.turn() === 'b' ? 'active' : ''}`}>
            {formatTime(blackTime)}
          </div>
        </div>
        
        <div className="board-wrapper">
          <Chessboard
            id="simple-chess-board"
            position={fen}
            onSquareClick={onSquareClick}
            customSquareStyles={optionSquares}
            boardOrientation={orientation}
          />
        </div>
        
        <div className="player-info white">
          <div className="player-name">White</div>
          <div className={`player-clock ${game.turn() === 'w' ? 'active' : ''}`}>
            {formatTime(whiteTime)}
          </div>
        </div>
        
        <div className="game-status">
          {status === 'ongoing' ? (
            <div>
              {game.turn() === 'w' ? 'White' : 'Black'} to move
            </div>
          ) : (
            <div className="game-result">
              {outcome === 'white' ? 'White wins' : 
               outcome === 'black' ? 'Black wins' : 
               'Draw'}
            </div>
          )}
        </div>
      </div>
      
      <style jsx="true">{`
        .chess-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        
        h1 {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .chess-controls {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        
        .time-controls, .game-buttons {
          display: flex;
          gap: 10px;
        }
        
        .time-controls label {
          display: flex;
          flex-direction: column;
        }
        
        select, button {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ccc;
          background-color: white;
          cursor: pointer;
        }
        
        button {
          background-color: #4caf50;
          color: white;
          border: none;
        }
        
        button:hover {
          background-color: #45a049;
        }
        
        .chess-board-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .board-wrapper {
          width: 100%;
          max-width: 600px;
          margin: 20px 0;
        }
        
        .player-info {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 10px;
          background-color: #f5f5f5;
          border-radius: 5px;
        }
        
        .player-clock {
          font-size: 24px;
          font-weight: bold;
        }
        
        .player-clock.active {
          color: #4caf50;
        }
        
        .game-status {
          margin-top: 10px;
          font-size: 18px;
          text-align: center;
        }
        
        .game-result {
          font-weight: bold;
          color: #e53935;
        }
      `}</style>
    </div>
  );
};

export default SimpleChessPage;