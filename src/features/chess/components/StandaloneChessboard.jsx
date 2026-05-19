// StandaloneChessboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import '../styles/StandaloneChessboard.css';

// Wrapper for chess.js to maintain API compatibility with our existing code
class ChessEngine {
  constructor() {
    this.chess = new Chess();
    this.reset();
  }
  
  reset() {
    this.chess.reset();
    this.moveHistory = [];
    this.status = 'active';
    this.board = this.convertFenToBoard(this.chess.fen());
  }
  
  // Convert FEN string to our board format
  convertFenToBoard(fen) {
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
  
  // Convert our board coordinates to algebraic notation
  squareToAlgebraic(row, col) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    return files[col] + (8 - row);
  }
  
  // Convert algebraic notation to our board coordinates
  algebraicToSquare(algebraic) {
    const files = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7 };
    const file = algebraic.charAt(0);
    const rank = algebraic.charAt(1);
    
    return {
      row: 8 - parseInt(rank),
      col: files[file]
    };
  }
  
  getPiece(row, col) {
    if (row < 0 || row > 7 || col < 0 || col > 7) return null;
    return this.board[row][col];
  }
  
  isWhitePiece(piece) {
    return piece !== ' ' && piece === piece.toUpperCase();
  }
  
  isBlackPiece(piece) {
    return piece !== ' ' && piece === piece.toLowerCase();
  }
  
  isCurrentPlayerPiece(row, col) {
    const piece = this.getPiece(row, col);
    if (piece === ' ') return false;
    
    return (this.chess.turn() === 'w') ? 
      this.isWhitePiece(piece) : 
      this.isBlackPiece(piece);
  }
  
  getValidMoves(row, col) {
    const from = this.squareToAlgebraic(row, col);
    const moves = [];
    
    // Get all legal moves from chess.js
    const legalMoves = this.chess.moves({ 
      square: from, 
      verbose: true 
    });
    
    legalMoves.forEach(move => {
      const toSquare = this.algebraicToSquare(move.to);
      
      // Determine if it's a capture
      const isCapture = move.flags.includes('c') || move.flags.includes('e');
      
      // Check for special moves
      const isCastle = move.flags.includes('k') || move.flags.includes('q');
      const isEnPassant = move.flags.includes('e');
      const isPromotion = move.flags.includes('p');
      
      const moveData = { 
        row: toSquare.row, 
        col: toSquare.col, 
        capture: isCapture
      };
      
      // Add special move flags
      if (isCastle) {
        moveData.castle = move.flags.includes('k') ? 'kingside' : 'queenside';
      }
      
      if (isEnPassant) {
        moveData.enPassant = true;
      }
      
      if (isPromotion) {
        moveData.promotion = true;
      }
      
      moves.push(moveData);
    });
    
    return moves;
  }
  
  movePiece(fromRow, fromCol, toRow, toCol, promotion = 'q') {
    const from = this.squareToAlgebraic(fromRow, fromCol);
    const to = this.squareToAlgebraic(toRow, toCol);
    
    // Get the piece for history
    const piece = this.getPiece(fromRow, fromCol);
    
    // Check if it's a valid move
    const move = {
      from: from,
      to: to,
      promotion: promotion
    };
    
    try {
      // Try to make the move using chess.js
      const result = this.chess.move(move);
      
      if (!result) {
        return false; // Invalid move
      }
      
      // Record the move for our own history
      const moveRecord = {
        piece: piece,
        from: { row: fromRow, col: fromCol },
        to: { row: toRow, col: toCol },
        captured: result.captured ? result.captured : ' ',
        promotion: result.promotion,
        flags: result.flags
      };
      
      this.moveHistory.push(moveRecord);
      
      // Update our board representation
      this.board = this.convertFenToBoard(this.chess.fen());
      
      // Update game status
      this.updateGameStatus();
      
      return true;
    } catch (err) {
      console.error('Error making move:', err);
      return false;
    }
  }
  
  updateGameStatus() {
    // Update game status based on chess.js state
    if (this.chess.isGameOver()) {
      this.status = 'finished';
      if (this.chess.isCheckmate()) {
        // Set the winner
        this.result = this.chess.turn() === 'w' ? 'black' : 'white';
      } else if (this.chess.isDraw()) {
        this.result = 'draw';
      }
    } else {
      this.status = 'active';
      this.check = this.chess.isCheck();
    }
  }
  
  undoLastMove() {
    try {
      const undone = this.chess.undo();
      if (!undone) return false;
      
      // Remove the last move from our history
      if (this.moveHistory.length > 0) {
        this.moveHistory.pop();
      }
      
      // Update our board representation
      this.board = this.convertFenToBoard(this.chess.fen());
      
      // Update game status
      this.updateGameStatus();
      
      return true;
    } catch (err) {
      console.error('Error undoing move:', err);
      return false;
    }
  }
  
  getGameState() {
    return {
      board: this.board.map(row => [...row]), // Return a copy of the board
      currentPlayer: this.chess.turn(),
      status: this.status,
      check: this.chess.isCheck(),
      moveCount: this.moveHistory.length,
      isCheckmate: this.chess.isCheckmate(),
      isDraw: this.chess.isDraw(),
      result: this.result,
      fen: this.chess.fen(),
      pgn: this.chess.pgn()
    };
  }
}

// Piece types mapping
const PIECE_TYPES = {
  'p': 'pawn',
  'n': 'knight',
  'b': 'bishop',
  'r': 'rook',
  'q': 'queen',
  'k': 'king'
};

// Main chess component
const StandaloneChessboard = ({ onMove, onEngineRef, defaultPosition = 'start', timeControl = 600, increment = 5 }) => {
  const [engine] = useState(new ChessEngine());
  const [gameState, setGameState] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [whiteTime, setWhiteTime] = useState(timeControl);
  const [blackTime, setBlackTime] = useState(timeControl);
  const [clockRunning, setClockRunning] = useState(false);
  const clockIntervalRef = useRef(null);
  
  // Initialize game state
  useEffect(() => {
    engine.reset();
    setGameState(engine.getGameState());
    setSelectedSquare(null);
    setValidMoves([]);
    setWhiteTime(timeControl);
    setBlackTime(timeControl);
    setClockRunning(false);
    
    // Expose the engine reference
    if (onEngineRef) {
      onEngineRef(engine);
    }
    
    // Clean up clock interval on unmount
    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
      }
    };
  }, [engine, timeControl, onEngineRef]);
  
  // Clock logic
  useEffect(() => {
    if (clockRunning) {
      clockIntervalRef.current = setInterval(() => {
        if (gameState?.status !== 'active') {
          clearInterval(clockIntervalRef.current);
          return;
        }
        
        if (gameState?.currentPlayer === 'w') {
          setWhiteTime(time => {
            if (time <= 1) {
              // Handle white timeout
              clearInterval(clockIntervalRef.current);
              return 0;
            }
            return time - 1;
          });
        } else {
          setBlackTime(time => {
            if (time <= 1) {
              // Handle black timeout
              clearInterval(clockIntervalRef.current);
              return 0;
            }
            return time - 1;
          });
        }
      }, 1000);
    }
    
    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
      }
    };
  }, [clockRunning, gameState]);
  
  // Format time display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Handle square click
  const handleSquareClick = useCallback((row, col) => {
    if (gameState?.status !== 'active') return;
    
    // If a square is already selected
    if (selectedSquare) {
      // Check if the clicked square is a valid move
      const isValidMove = validMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        // Make the move
        const moveResult = engine.movePiece(
          selectedSquare.row, 
          selectedSquare.col, 
          row, 
          col
        );
        
        if (moveResult) {
          // Start the clock if not running
          if (!clockRunning) {
            setClockRunning(true);
          }
          
          // Apply increment to the player who just moved
          if (gameState.currentPlayer === 'w') {
            setBlackTime(time => time + increment);
          } else {
            setWhiteTime(time => time + increment);
          }
          
          // Update game state
          setGameState(engine.getGameState());
          setSelectedSquare(null);
          setValidMoves([]);
          
          // Notify parent component if callback provided
          if (onMove) {
            onMove({
              from: { row: selectedSquare.row, col: selectedSquare.col },
              to: { row, col },
              piece: engine.board[row][col]
            });
          }
        }
      } else {
        // If clicking on own piece, select it; otherwise clear selection
        const piece = gameState.board[row][col];
        const isCurrentPlayerPiece = 
          piece !== ' ' && 
          ((gameState.currentPlayer === 'w' && engine.isWhitePiece(piece)) ||
           (gameState.currentPlayer === 'b' && engine.isBlackPiece(piece)));
        
        if (isCurrentPlayerPiece) {
          // Select new piece
          setSelectedSquare({ row, col });
          setValidMoves(engine.getValidMoves(row, col));
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
        ((gameState.currentPlayer === 'w' && engine.isWhitePiece(piece)) ||
         (gameState.currentPlayer === 'b' && engine.isBlackPiece(piece)));
      
      if (isCurrentPlayerPiece) {
        setSelectedSquare({ row, col });
        setValidMoves(engine.getValidMoves(row, col));
      }
    }
  }, [engine, gameState, selectedSquare, validMoves, clockRunning, increment, onMove]);
  
  // Handle undo
  const handleUndo = useCallback(() => {
    engine.undoLastMove();
    setGameState(engine.getGameState());
    setSelectedSquare(null);
    setValidMoves([]);
  }, [engine]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    engine.reset();
    setGameState(engine.getGameState());
    setSelectedSquare(null);
    setValidMoves([]);
    setWhiteTime(timeControl);
    setBlackTime(timeControl);
    setClockRunning(false);
    
    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
      clockIntervalRef.current = null;
    }
  }, [engine, timeControl]);
  
  // Handle board flip
  const handleFlipBoard = useCallback(() => {
    setBoardFlipped(prev => !prev);
  }, []);
  
  // Render the board
  if (!gameState) return <div>Loading...</div>;
  
  return (
    <div className="standalone-chess">
      <div className="game-container">
        <div className="player-info black">
          <div>Black</div>
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
                    <div className={`piece ${engine.isWhitePiece(piece) ? 'white' : 'black'}`}>
                      <img 
                        src={`/pieces/${PIECE_TYPES[piece.toLowerCase()]}-${engine.isWhitePiece(piece) ? 'w' : 'b'}.svg`} 
                        alt={`${engine.isWhitePiece(piece) ? 'White' : 'Black'} ${PIECE_TYPES[piece.toLowerCase()]}`}
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
          <div>White</div>
          <div className={`clock ${gameState.currentPlayer === 'w' ? 'active' : ''}`}>
            {formatTime(whiteTime)}
          </div>
        </div>
        
        <div className="game-status">
          {gameState.status === 'active' ? (
            <div>
              {gameState.currentPlayer === 'w' ? 'White' : 'Black'} to move
              {gameState.check ? ' (Check)' : ''}
            </div>
          ) : (
            <div className="game-over">
              Game over: {gameState.result || 'Unknown result'}
            </div>
          )}
        </div>
      </div>
      
      <div className="controls">
        <button onClick={handleReset}>New Game</button>
        <button onClick={handleUndo}>Undo Move</button>
        <button onClick={handleFlipBoard}>Flip Board</button>
      </div>
    </div>
  );
};

export default StandaloneChessboard;