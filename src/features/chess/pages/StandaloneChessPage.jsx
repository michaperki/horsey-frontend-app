// StandaloneChessPage.jsx
import React, { useState, useCallback, useRef } from 'react';
import StandaloneChessboard from '../components/StandaloneChessboard';
import DevModeChessProvider, { useDevModeChess } from '../contexts/DevModeChessProvider';
import ChessErrorBoundary from '../utils/ErrorBoundary';
import '../styles/StandaloneChessPage.css';

// Inner component that has access to the dev mode context
const ChessPageContent = () => {
  const { isDevMode, toggleDevMode, autoPlaying, startAutoPlay, stopAutoPlay } = useDevModeChess();
  const chessEngineRef = useRef(null);
  const [timeControl, setTimeControl] = useState(10);
  const [increment, setIncrement] = useState(5);
  const [moveHistory, setMoveHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  
  // Handle move event from the chessboard
  const handleMove = useCallback((move) => {
    setMoveHistory(prev => [...prev, move]);
  }, []);
  
  // Reference to the chess engine
  const handleChessEngineRef = useCallback((engineInstance) => {
    chessEngineRef.current = engineInstance;
  }, []);
  
  // Get piece name for move history
  const getPieceName = useCallback((piece) => {
    const pieceMap = {
      'p': 'Pawn',
      'n': 'Knight',
      'b': 'Bishop',
      'r': 'Rook',
      'q': 'Queen',
      'k': 'King'
    };
    
    const pieceType = piece.toLowerCase();
    return pieceMap[pieceType] || 'Piece';
  }, []);
  
  // Convert column number to letter
  const getColumnLetter = useCallback((col) => {
    return String.fromCharCode(97 + col); // 'a' is charCode 97
  }, []);
  
  // Format move for display
  const formatMove = useCallback((move, index) => {
    const piece = move.piece || '?';
    const from = `${getColumnLetter(move.from.col)}${8 - move.from.row}`;
    const to = `${getColumnLetter(move.to.col)}${8 - move.to.row}`;
    
    return {
      moveNumber: Math.floor(index / 2) + 1,
      isWhite: index % 2 === 0,
      notation: `${getPieceName(piece)} ${from}-${to}`
    };
  }, [getPieceName, getColumnLetter]);
  
  return (
    <div className="chess-page">
      <header className="chess-header">
        <h1>Chess Game</h1>
        <div className="return-links">
          <a href="/" className="return-link">← Back to Home</a>
        </div>
      </header>
      
      <div className="chess-container">
        <div className="chess-settings">
          <div className="time-settings">
            <label>
              Time Control:
              <select 
                value={timeControl} 
                onChange={(e) => setTimeControl(parseInt(e.target.value))}
              >
                <option value={1}>1 min</option>
                <option value={3}>3 min</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
              </select>
            </label>
            
            <label>
              Increment:
              <select 
                value={increment} 
                onChange={(e) => setIncrement(parseInt(e.target.value))}
              >
                <option value={0}>0 sec</option>
                <option value={1}>1 sec</option>
                <option value={2}>2 sec</option>
                <option value={5}>5 sec</option>
                <option value={10}>10 sec</option>
              </select>
            </label>
            
            <button 
              onClick={() => window.location.reload()} 
              className="apply-button"
            >
              Apply Settings
            </button>
            
            {isDevMode && (
              <div className="dev-controls">
                <button
                  onClick={() => autoPlaying ? stopAutoPlay() : startAutoPlay(chessEngineRef.current)}
                  className={`dev-button ${autoPlaying ? 'stop' : 'start'}`}
                >
                  {autoPlaying ? 'Stop Auto-Play' : 'Start Auto-Play'}
                </button>
                <button
                  onClick={toggleDevMode}
                  className="dev-button toggle"
                >
                  Disable Dev Mode
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="chess-main">
          <StandaloneChessboard 
            timeControl={timeControl * 60}
            increment={increment}
            onMove={handleMove}
            onEngineRef={handleChessEngineRef}
          />
          
          {moveHistory.length > 0 && showHistory && (
            <div className="move-history">
              <div className="history-header">
                <h3>Move History</h3>
                <button onClick={() => setShowHistory(false)}>Hide</button>
              </div>
              <div className="history-list">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>White</th>
                      <th>Black</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => {
                      const whiteMove = moveHistory[i * 2];
                      const blackMove = moveHistory[i * 2 + 1];
                      
                      return (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            {whiteMove && formatMove(whiteMove, i * 2).notation}
                          </td>
                          <td>
                            {blackMove && formatMove(blackMove, i * 2 + 1).notation}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {moveHistory.length > 0 && !showHistory && (
            <button 
              onClick={() => setShowHistory(true)}
              className="show-history-button"
            >
              Show Move History
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap the content with the provider and error boundary
const StandaloneChessPage = () => {
  return (
    <ChessErrorBoundary>
      <DevModeChessProvider>
        <ChessPageContent />
      </DevModeChessProvider>
    </ChessErrorBoundary>
  );
};

export default StandaloneChessPage;