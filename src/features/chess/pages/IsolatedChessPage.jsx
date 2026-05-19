// src/features/chess/pages/IsolatedChessPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Paper, 
  Divider, 
  TextField,
  Container
} from '@mui/material';

// Remove the window check to prevent hooks errors
const isStandaloneMode = () => {
  try {
    const url = new URL(window.location.href);
    return url.searchParams.has('standalone') || 
      url.pathname === '/chess' || 
      url.pathname === '/chess/play';
  } catch (e) {
    return false;
  }
};

/**
 * A completely isolated chess implementation with no server dependencies
 */
const IsolatedChessPage = () => {
  // Game state
  const [game, setGame] = useState(() => new Chess());
  const [fen, setFen] = useState(() => new Chess().fen());
  const [orientation, setOrientation] = useState('white');
  const [moveFrom, setMoveFrom] = useState('');
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [timeControl, setTimeControl] = useState(10);
  const [increment, setIncrement] = useState(5);
  const [newPosition, setNewPosition] = useState('');
  
  // Clock state
  const [whiteTime, setWhiteTime] = useState(10 * 60); // 10 minutes in seconds
  const [blackTime, setBlackTime] = useState(10 * 60);
  const [clockRunning, setClockRunning] = useState(false);
  const clockIntervalRef = useRef(null);
  const lastMoveTimeRef = useRef(Date.now());
  
  // Game status
  const [status, setStatus] = useState('ongoing');
  const [outcome, setOutcome] = useState('');
  
  // Player info
  const whitePlayer = { name: 'White' };
  const blackPlayer = { name: 'Black' };
  
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
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
      }
    };
  }, []);
  
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
  
  // Handle right-click to mark squares
  const onSquareRightClick = (square) => {
    const color = rightClickedSquares[square]
      ? rightClickedSquares[square].backgroundColor === 'rgba(0, 0, 255, 0.4)'
        ? 'rgba(255, 0, 0, 0.4)'
        : rightClickedSquares[square].backgroundColor === 'rgba(255, 0, 0, 0.4)'
          ? undefined
          : 'rgba(0, 0, 255, 0.4)'
      : 'rgba(0, 0, 255, 0.4)';
      
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]: color ? { backgroundColor: color } : undefined
    });
  };
  
  // Reset the game
  const handleReset = () => {
    stopClock();
    setGame(new Chess());
    setFen(new Chess().fen());
    setMoveFrom('');
    setOptionSquares({});
    setRightClickedSquares({});
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
  
  // Set a custom position
  const handleSetPosition = () => {
    if (!newPosition.trim()) return;
    
    try {
      const newGame = new Chess(newPosition);
      setGame(newGame);
      setFen(newGame.fen());
      setMoveFrom('');
      setOptionSquares({});
      setStatus('ongoing');
      setOutcome('');
    } catch (e) {
      console.error('Invalid FEN:', e);
      alert('Invalid position. Please enter a valid FEN string.');
    }
  };
  
  // Handle resignation
  const handleResign = () => {
    stopClock();
    setStatus('finished');
    setOutcome(game.turn() === 'w' ? 'black' : 'white');
  };
  
  // Handle draw offer/agreement
  const handleDraw = () => {
    stopClock();
    setStatus('finished');
    setOutcome('draw');
  };
  
  // Apply time control changes
  const applyTimeControl = () => {
    setWhiteTime(timeControl * 60);
    setBlackTime(timeControl * 60);
    stopClock();
  };
  
  // Display game result
  const gameResult = () => {
    if (status !== 'finished') return null;
    
    let result = '';
    
    switch (outcome) {
      case 'white':
        result = 'White wins';
        break;
      case 'black':
        result = 'Black wins';
        break;
      case 'draw':
        result = 'Draw';
        break;
      default:
        result = 'Game over';
    }
    
    return (
      <Typography variant="h6" color="error" align="center" sx={{ mt: 2 }}>
        {result}
      </Typography>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Chess
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Game Controls
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Time (min)</InputLabel>
                    <Select
                      value={timeControl}
                      label="Time (min)"
                      onChange={(e) => setTimeControl(e.target.value)}
                    >
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={3}>3</MenuItem>
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                      <MenuItem value={15}>15</MenuItem>
                      <MenuItem value={30}>30</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Increment (sec)</InputLabel>
                    <Select
                      value={increment}
                      label="Increment (sec)"
                      onChange={(e) => setIncrement(e.target.value)}
                    >
                      <MenuItem value={0}>0</MenuItem>
                      <MenuItem value={1}>1</MenuItem>
                      <MenuItem value={2}>2</MenuItem>
                      <MenuItem value={5}>5</MenuItem>
                      <MenuItem value={10}>10</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    variant="contained"
                    onClick={applyTimeControl}
                    fullWidth
                  >
                    Apply Time Control
                  </Button>
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  label="FEN Position"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  placeholder="Enter FEN to set position"
                />
                
                <Button
                  variant="outlined"
                  onClick={handleSetPosition}
                  disabled={!newPosition.trim()}
                >
                  Set Position
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleReset}
                >
                  Reset Game
                </Button>
                
                <Button 
                  variant="outlined"
                  onClick={handleSwitchSides}
                >
                  Switch Sides
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Box>
                  <Typography variant="subtitle1">
                    {blackPlayer.name}
                  </Typography>
                  <Typography variant="h6" color={game.turn() === 'b' ? 'primary' : 'textSecondary'}>
                    {formatTime(blackTime)}
                  </Typography>
                </Box>
                
                {/* Game status or result */}
                <Box>
                  {gameResult()}
                  {status === 'ongoing' && (
                    <Typography variant="subtitle1" align="center">
                      {game.turn() === 'w' ? 'White to move' : 'Black to move'}
                    </Typography>
                  )}
                </Box>
                
                <Box>
                  <Typography variant="subtitle1" align="right">
                    {whitePlayer.name}
                  </Typography>
                  <Typography variant="h6" align="right" color={game.turn() === 'w' ? 'primary' : 'textSecondary'}>
                    {formatTime(whiteTime)}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ width: '100%', maxWidth: 560, mx: 'auto' }}>
                <Chessboard
                  id="isolated-board"
                  position={fen}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={onSquareRightClick}
                  customSquareStyles={{
                    ...optionSquares,
                    ...rightClickedSquares
                  }}
                  boardOrientation={orientation}
                  areArrowsAllowed={true}
                />
              </Box>
              
              <Box display="flex" justifyContent="center" mt={2} gap={2}>
                {status === 'ongoing' && (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleDraw}
                    >
                      Agree to Draw
                    </Button>
                    <Button 
                      variant="contained" 
                      color="error"
                      onClick={handleResign}
                    >
                      Resign
                    </Button>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Game Info
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body1" gutterBottom>
                <strong>White:</strong> {whitePlayer.name}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Black:</strong> {blackPlayer.name}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Time Control:</strong> {timeControl}+{increment}
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {status}
              </Typography>
              
              {status === 'finished' && (
                <Typography variant="body1" gutterBottom>
                  <strong>Result:</strong> {outcome}
                </Typography>
              )}

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                How to Play
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Click on a piece to select it
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Click on a highlighted square to move
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Right-click on squares to mark them
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Use the controls to reset, switch sides, or set a position
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default IsolatedChessPage;