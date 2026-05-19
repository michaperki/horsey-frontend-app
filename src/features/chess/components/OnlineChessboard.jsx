// src/features/chess/components/OnlineChessboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import { useSocket } from '../../common/contexts/SocketContext';
import { useAuth } from '../../auth/contexts/AuthContext';
import '../styles/StandaloneChessboard.css';

// Piece types mapping
const PIECE_TYPES = {
  'p': 'pawn',
  'n': 'knight',
  'b': 'bishop',
  'r': 'rook',
  'q': 'queen',
  'k': 'king'
};

// Chess board component that connects to the server via websockets
const OnlineChessboard = ({ 
  gameId, 
  orientation = 'white',
  onGameStateChange,
  onGameOver,
  onError
}) => {
  const socket = useSocket();
  const { user } = useAuth();
  
  // Game state
  const [game] = useState(new Chess());
  const [gameState, setGameState] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [boardFlipped, setBoardFlipped] = useState(orientation === 'black');
  
  // Clock state
  const [whiteTime, setWhiteTime] = useState(600); // Default 10 minutes
  const [blackTime, setBlackTime] = useState(600);
  const [clockRunning, setClockRunning] = useState(false);
  const clockIntervalRef = useRef(null);
  
  // Game status
  const [playerColor, setPlayerColor] = useState(null);
  const [isSpectator, setIsSpectator] = useState(false);
  const [drawOffered, setDrawOffered] = useState(false);
  const [drawOfferFrom, setDrawOfferFrom] = useState(null);
  
  // Join the game when the component mounts
  useEffect(() => {
    if (socket && gameId) {
      console.log('Joining chess game:', gameId);
      socket.emit('joinChessGame', { gameId });
      
      // Set up event listeners
      socket.on('gameState', handleGameState);
      socket.on('chessMoved', handleMove);
      socket.on('clockUpdate', handleClockUpdate);
      socket.on('gameOver', handleGameOver);
      socket.on('drawOffered', handleDrawOffer);
      socket.on('drawDeclined', handleDrawDeclined);
      socket.on('gameError', handleGameError);
      
      return () => {
        // Clean up event listeners when the component unmounts
        socket.off('gameState');
        socket.off('chessMoved');
        socket.off('clockUpdate');
        socket.off('gameOver');
        socket.off('drawOffered');
        socket.off('drawDeclined');
        socket.off('gameError');
      };
    }
  }, [socket, gameId]);
  
  // Update player color based on game state
  useEffect(() => {
    if (gameState && user) {
      if (gameState.whitePlayer?.id === user.id) {
        setPlayerColor('w');
        setBoardFlipped(false);
      } else if (gameState.blackPlayer?.id === user.id) {
        setPlayerColor('b');
        setBoardFlipped(true);
      } else {
        setIsSpectator(true);
      }
    }
  }, [gameState, user]);
  
  // Handle game state update from server
  const handleGameState = useCallback((state) => {
    try {
      // Set the game position from FEN
      game.load(state.fen);
      
      // Update local game state
      setGameState({
        board: convertFenToBoard(state.fen),
        currentPlayer: game.turn(),
        fen: state.fen,
        status: state.status || 'active',
        whitePlayer: state.whitePlayer,
        blackPlayer: state.blackPlayer,
        whiteTime: state.whiteTime || 600,
        blackTime: state.blackTime || 600,
        increment: state.increment || 0,
        result: state.outcome
      });
      
      // Update clock times
      setWhiteTime(state.whiteTime || 600);
      setBlackTime(state.blackTime || 600);
      
      // Determine if the clock should be running
      setClockRunning(state.status === 'ongoing');
      
      // Pass game state to parent component if callback is provided
      if (onGameStateChange) {
        onGameStateChange(state);
      }
    } catch (err) {
      console.error('Error handling game state:', err);
      if (onError) {
        onError(err.message);
      }
    }
  }, [game, onGameStateChange, onError]);
  
  // Handle move update from server
  const handleMove = useCallback((moveData) => {
    try {
      // Set the game position from FEN
      game.load(moveData.fen);
      
      // Update local game state
      setGameState(prevState => ({
        ...prevState,
        board: convertFenToBoard(moveData.fen),
        currentPlayer: game.turn(),
        fen: moveData.fen,
        status: moveData.status || prevState.status,
        result: moveData.outcome || prevState.result
      }));
      
      // Clear any selected square
      setSelectedSquare(null);
      setValidMoves([]);
    } catch (err) {
      console.error('Error handling move:', err);
      if (onError) {
        onError(err.message);
      }
    }
  }, [game, onError]);
  
  // Handle clock update from server
  const handleClockUpdate = useCallback((clock) => {
    setWhiteTime(clock.whiteTime);
    setBlackTime(clock.blackTime);
    setClockRunning(true);
  }, []);
  
  // Handle game over event
  const handleGameOver = useCallback((data) => {
    setClockRunning(false);
    setGameState(prevState => ({
      ...prevState,
      status: 'finished',
      result: data.outcome
    }));
    
    // Notify parent component
    if (onGameOver) {
      onGameOver(data);
    }
  }, [onGameOver]);
  
  // Handle draw offer from opponent
  const handleDrawOffer = useCallback((data) => {
    setDrawOffered(true);
    setDrawOfferFrom(data.color);
  }, []);
  
  // Handle draw offer declined
  const handleDrawDeclined = useCallback(() => {
    setDrawOffered(false);
    setDrawOfferFrom(null);
  }, []);
  
  // Handle game error
  const handleGameError = useCallback((error) => {
    console.error('Game error:', error);
    if (onError) {
      onError(error.message);
    }
  }, [onError]);
  
  // Format time display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Convert FEN string to our board format
  function convertFenToBoard(fen) {
    const board = [];
    const fenBoard = fen.split(' ')[0];
    const rows = fenBoard.split('/');
    
    for (const row of rows) {
      const boardRow = [];
      for (const char of row) {
        if (isNaN(char)) {
          // Add the piece
          boardRow.push(char);
        } else {
          // Add empty squares
          for (let i = 0; i < parseInt(char); i++) {
            boardRow.push(' ');
          }
        }
      }
      board.push(boardRow);
    }
    
    return board;
  }
  
  // Convert board coordinates to algebraic notation
  function squareToAlgebraic(row, col) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return files[col] + (8 - row);
  }
  
  // Is this a white piece?
  function isWhitePiece(piece) {
    return piece !== ' ' && piece === piece.toUpperCase();
  }
  
  // Get valid moves for the selected square
  function getValidMoves(row, col) {
    const algebraic = squareToAlgebraic(row, col);
    const moves = [];
    
    // Get all legal moves from chess.js
    const legalMoves = game.moves({ 
      square: algebraic, 
      verbose: true 
    });
    
    legalMoves.forEach(move => {
      const toSquare = algebraicToSquare(move.to);
      
      // Determine if it's a capture
      const isCapture = move.flags.includes('c') || move.flags.includes('e');
      
      moves.push({ 
        row: toSquare.row, 
        col: toSquare.col, 
        capture: isCapture
      });
    });
    
    return moves;
  }
  
  // Convert algebraic notation to board coordinates
  function algebraicToSquare(algebraic) {
    const files = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
    const file = algebraic.charAt(0);
    const rank = algebraic.charAt(1);
    
    return {
      row: 8 - parseInt(rank),
      col: files[file]
    };
  }
  
  // Handle square click
  const handleSquareClick = useCallback((row, col) => {
    // Don't allow moves if not your turn, game is over, or you're a spectator
    if (!gameState || 
        gameState.status !== 'active' || 
        isSpectator || 
        (gameState.currentPlayer === 'w' && playerColor !== 'w') || 
        (gameState.currentPlayer === 'b' && playerColor !== 'b')) {
      return;
    }
    
    // If a square is already selected
    if (selectedSquare) {
      // Check if the clicked square is a valid move
      const isValidMove = validMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        // Send the move to the server
        const from = squareToAlgebraic(selectedSquare.row, selectedSquare.col);
        const to = squareToAlgebraic(row, col);
        
        // Check if this is a pawn promotion
        let promotion = undefined;
        const piece = gameState.board[selectedSquare.row][selectedSquare.col];
        const isLastRank = (playerColor === 'w' && row === 0) || (playerColor === 'b' && row === 7);
        
        if (piece.toLowerCase() === 'p' && isLastRank) {
          promotion = 'q'; // Auto-promote to queen for simplicity
        }
        
        socket.emit('chessMove', { 
          gameId, 
          move: {
            from,
            to,
            promotion
          }
        });
        
        // Clear selection
        setSelectedSquare(null);
        setValidMoves([]);
      } else {
        // If clicking on own piece, select it; otherwise clear selection
        const piece = gameState.board[row][col];
        const isCurrentPlayerPiece = 
          piece !== ' ' && 
          ((gameState.currentPlayer === 'w' && isWhitePiece(piece)) ||
           (gameState.currentPlayer === 'b' && !isWhitePiece(piece)));
        
        if (isCurrentPlayerPiece) {
          // Select new piece
          setSelectedSquare({ row, col });
          setValidMoves(getValidMoves(row, col));
        } else {
          // Clear selection
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    } else {
      // No square selected yet, try to select one
      const piece = gameState.board[row][col];
      const isCurrentPlayerPiece = 
        piece !== ' ' && 
        ((gameState.currentPlayer === 'w' && isWhitePiece(piece)) ||
         (gameState.currentPlayer === 'b' && !isWhitePiece(piece)));
      
      if (isCurrentPlayerPiece) {
        setSelectedSquare({ row, col });
        setValidMoves(getValidMoves(row, col));
      }
    }
  }, [gameState, selectedSquare, validMoves, playerColor, isSpectator, socket, gameId]);
  
  // Handle resignation
  const handleResign = useCallback(() => {
    if (socket && gameId && playerColor && !isSpectator) {
      socket.emit('resignGame', { gameId, color: playerColor });
    }
  }, [socket, gameId, playerColor, isSpectator]);
  
  // Offer a draw
  const handleOfferDraw = useCallback(() => {
    if (socket && gameId && playerColor && !isSpectator) {
      socket.emit('offerDraw', { gameId, color: playerColor });
    }
  }, [socket, gameId, playerColor, isSpectator]);
  
  // Accept draw offer
  const handleAcceptDraw = useCallback(() => {
    if (socket && gameId && drawOffered) {
      socket.emit('respondToDraw', { gameId, accepted: true });
      setDrawOffered(false);
    }
  }, [socket, gameId, drawOffered]);
  
  // Decline draw offer
  const handleDeclineDraw = useCallback(() => {
    if (socket && gameId && drawOffered) {
      socket.emit('respondToDraw', { gameId, accepted: false });
      setDrawOffered(false);
    }
  }, [socket, gameId, drawOffered]);
  
  // Flip the board
  const handleFlipBoard = useCallback(() => {
    setBoardFlipped(prev => !prev);
  }, []);
  
  // Loading state
  if (!gameState) {
    return (
      <div className="standalone-chess">
        <div className="loading">Loading game...</div>
      </div>
    );
  }
  
  return (
    <div className="standalone-chess">
      <div className="game-container">
        <div className="player-info black">
          <div>{gameState.blackPlayer?.name || 'Black'}</div>
          <div className={`clock ${gameState.currentPlayer === 'b' ? 'active' : ''}`}>
            {formatTime(blackTime)}
          </div>
        </div>
        
        <div className={`chessboard ${boardFlipped ? 'flipped' : ''}`}>
          {gameState.board.map((row, rowIndex) => (
            row.map((piece, colIndex) => {
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isSelected = selectedSquare && 
                selectedSquare.row === rowIndex && 
                selectedSquare.col === colIndex;
              
              const isValidMove = validMoves.some(
                move => move.row === rowIndex && move.col === colIndex
              );
              
              const isValidCapture = validMoves.some(
                move => move.row === rowIndex && 
                       move.col === colIndex && 
                       move.capture
              );
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    square 
                    ${isLight ? 'light' : 'dark'}
                    ${isSelected ? 'selected' : ''}
                    ${isValidMove && !isValidCapture ? 'valid-move' : ''}
                    ${isValidCapture ? 'valid-capture' : ''}
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {piece !== ' ' && (
                    <div className={`piece ${isWhitePiece(piece) ? 'white' : 'black'}`}>
                      <img 
                        src={`/pieces/${PIECE_TYPES[piece.toLowerCase()]}-${isWhitePiece(piece) ? 'w' : 'b'}.svg`} 
                        alt={`${isWhitePiece(piece) ? 'White' : 'Black'} ${PIECE_TYPES[piece.toLowerCase()]}`}
                        onError={(e) => {
                          // If image fails to load, fallback to a text representation
                          e.target.style.display = 'none';
                          e.target.parentNode.innerText = piece;
                          e.target.parentNode.style.display = 'flex';
                          e.target.parentNode.style.justifyContent = 'center';
                          e.target.parentNode.style.alignItems = 'center';
                          e.target.parentNode.style.fontSize = '24px';
                          e.target.parentNode.style.fontWeight = 'bold';
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          ))}
        </div>
        
        <div className="player-info white">
          <div>{gameState.whitePlayer?.name || 'White'}</div>
          <div className={`clock ${gameState.currentPlayer === 'w' ? 'active' : ''}`}>
            {formatTime(whiteTime)}
          </div>
        </div>
        
        <div className="game-status">
          {gameState.status === 'active' ? (
            <div>
              {gameState.currentPlayer === 'w' ? 'White' : 'Black'} to move
              {game.isCheck() ? ' (Check)' : ''}
            </div>
          ) : (
            <div className="game-over">
              Game over: {gameState.result || 'Unknown result'}
            </div>
          )}
          
          {drawOffered && (
            <div className="draw-offer">
              Draw offered by {drawOfferFrom === 'w' ? 'White' : 'Black'}
              <div className="draw-buttons">
                <button onClick={handleAcceptDraw}>Accept</button>
                <button onClick={handleDeclineDraw}>Decline</button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="controls">
        <button onClick={handleFlipBoard}>Flip Board</button>
        
        {!isSpectator && gameState.status === 'active' && (
          <>
            <button onClick={handleOfferDraw} disabled={drawOffered}>
              Offer Draw
            </button>
            <button onClick={handleResign} className="resign-btn">
              Resign
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OnlineChessboard;