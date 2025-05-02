// src/features/chess/ChessBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useSocket } from '../common/contexts/SocketContext';
import { useAuth } from '../auth/contexts/AuthContext';
import { 
  Box, 
  Button, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grid,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';

// Format seconds to mm:ss
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const ChessBoard = ({ gameId }) => {
  const socket = useSocket();
  const { user } = useAuth();
  
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState('');
  const [gameState, setGameState] = useState({
    status: 'loading',
    outcome: '',
    whitePlayer: null,
    blackPlayer: null,
    whiteTime: 600,
    blackTime: 600,
    activeColor: 'w'
  });
  
  const [orientation, setOrientation] = useState('white');
  const [moveFrom, setMoveFrom] = useState('');
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [drawOfferedBy, setDrawOfferedBy] = useState(null);
  
  // Load initial game state
  useEffect(() => {
    if (socket && gameId) {
      
      // Listen for game state updates
      socket.on('gameState', handleGameState);
      socket.on('chessMoved', handleMove);
      socket.on('clockUpdate', handleClockUpdate);
      socket.on('gameOver', handleGameOver);
      socket.on('drawOffered', handleDrawOffer);
      socket.on('drawDeclined', handleDrawDeclined);
      socket.on('gameError', handleGameError);
      
      return () => {
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
  
  // Set orientation based on player color
  useEffect(() => {
    if (gameState.whitePlayer && gameState.blackPlayer && user) {
      if (gameState.whitePlayer.id === user.id) {
        setOrientation('white');
      } else if (gameState.blackPlayer.id === user.id) {
        setOrientation('black');
      }
    }
  }, [gameState.whitePlayer, gameState.blackPlayer, user]);
  
  // Handle game state update
  const handleGameState = (state) => {
    // Update chess instance with current FEN
    const newGame = new Chess(state.fen);
    setGame(newGame);
    setFen(state.fen);
    
    // Update game state
    setGameState({
      status: state.status,
      outcome: state.outcome || '',
      whitePlayer: state.whitePlayer,
      blackPlayer: state.blackPlayer,
      whiteTime: state.whiteTime,
      blackTime: state.blackTime,
      activeColor: state.activeColor || newGame.turn()
    });
  };
  
  // Handle move updates
  const handleMove = (move) => {
    // Update chess instance
    const newGame = new Chess(move.fen);
    setGame(newGame);
    setFen(move.fen);
    
    // Update game state
    setGameState(prevState => ({
      ...prevState,
      status: move.status || prevState.status,
      outcome: move.outcome || prevState.outcome,
      whiteTime: move.whiteTime || prevState.whiteTime,
      blackTime: move.blackTime || prevState.blackTime,
      activeColor: newGame.turn()
    }));
  };
  
  // Handle clock updates
  const handleClockUpdate = (clock) => {
    setGameState(prevState => ({
      ...prevState,
      whiteTime: clock.whiteTime,
      blackTime: clock.blackTime,
      activeColor: clock.activeColor
    }));
  };
  
  // Handle game over
  const handleGameOver = (data) => {
    setGameState(prevState => ({
      ...prevState,
      status: 'finished',
      outcome: data.outcome
    }));
    
    // Display a message or update UI
    console.log('Game over:', data);
  };
  
  // Handle draw declined
  const handleDrawDeclined = () => {
    console.log('Draw offer declined');
    // You could display a message here
  };
  
  // Handle game errors
  const handleGameError = (error) => {
    console.error('Game error:', error);
    // You could display an error message here
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
    // Don't allow moves if the game is over or not your turn
    if (gameState.status !== 'ongoing' || 
        (gameState.activeColor === 'w' && gameState.whitePlayer?.id !== user?.id) || 
        (gameState.activeColor === 'b' && gameState.blackPlayer?.id !== user?.id)) {
      return;
    }
    
    // Check if we already have a piece selected
    if (moveFrom === '') {
      // No piece selected yet - select the piece if it belongs to the player
      const piece = game.get(square);
      if (piece && piece.color === gameState.activeColor) {
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
          // Emit move to server
          socket.emit('chessMove', { 
            gameId, 
            move: {
              from: moveFrom,
              to: square,
              promotion: move.promotion || undefined
            }
          });
          
          // Clear selection
          setMoveFrom('');
          setOptionSquares({});
        } catch (e) {
          console.error(e);
          // If the move fails, keep the same piece selected
          setOptionSquares(getMoveOptions(moveFrom));
        }
      } else {
        // If it's not a valid move, check if we're selecting a new piece
        const piece = game.get(square);
        if (piece && piece.color === gameState.activeColor) {
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
  
  // Resign the game
  const handleResign = () => {
    if (socket && gameId) {
      const color = gameState.whitePlayer?.id === user?.id ? 'w' : 'b';
      socket.emit('resignGame', { gameId, color });
    }
  };
  
  // Offer a draw
  const handleDrawOffer = () => {
    if (socket && gameId) {
      const color = gameState.whitePlayer?.id === user?.id ? 'w' : 'b';
      socket.emit('offerDraw', { gameId, color });
    }
  };
  
  // Accept a draw
  const handleAcceptDraw = () => {
    if (socket && gameId) {
      socket.emit('respondToDraw', { gameId, accepted: true });
      setDrawDialogOpen(false);
    }
  };
  
  // Decline a draw
  const handleDeclineDraw = () => {
    if (socket && gameId) {
      socket.emit('respondToDraw', { gameId, accepted: false });
      setDrawDialogOpen(false);
    }
  };
  
  // Display the game result
  const gameResult = () => {
    if (gameState.status !== 'finished') return null;
    
    let result = '';
    
    switch (gameState.outcome) {
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
  
  // Render loading state if game is not loaded yet
  if (gameState.status === 'loading') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="subtitle1">
                {gameState.blackPlayer?.name || 'Black'}
              </Typography>
              <Typography variant="h6" color={gameState.activeColor === 'b' ? 'primary' : 'textSecondary'}>
                {formatTime(gameState.blackTime)}
              </Typography>
            </Box>
            
            {/* Game status or result */}
            <Box>
              {gameResult()}
              {gameState.status === 'ongoing' && (
                <Typography variant="subtitle1" align="center">
                  {gameState.activeColor === 'w' ? 'White to move' : 'Black to move'}
                </Typography>
              )}
            </Box>
            
            <Box>
              <Typography variant="subtitle1" align="right">
                {gameState.whitePlayer?.name || 'White'}
              </Typography>
              <Typography variant="h6" align="right" color={gameState.activeColor === 'w' ? 'primary' : 'textSecondary'}>
                {formatTime(gameState.whiteTime)}
              </Typography>
            </Box>
          </Box>
          
          <Chessboard
            id="chess-board"
            position={fen || 'start'}
            onSquareClick={onSquareClick}
            onSquareRightClick={onSquareRightClick}
            customSquareStyles={{
              ...optionSquares,
              ...rightClickedSquares
            }}
            boardOrientation={orientation}
          />
          
          <Box display="flex" justifyContent="center" mt={2} gap={2}>
            {gameState.status === 'ongoing' && (
              <>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleDrawOffer}
                  disabled={
                    (gameState.activeColor === 'w' && gameState.whitePlayer?.id !== user?.id) || 
                    (gameState.activeColor === 'b' && gameState.blackPlayer?.id !== user?.id)
                  }
                >
                  Offer Draw
                </Button>
                <Button 
                  variant="contained" 
                  color="error"
                  onClick={handleResign}
                  disabled={
                    (gameState.whitePlayer?.id !== user?.id) && 
                    (gameState.blackPlayer?.id !== user?.id)
                  }
                >
                  Resign
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Grid>
      
      <Grid xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Game Info
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body1" gutterBottom>
            <strong>White:</strong> {gameState.whitePlayer?.name || 'White'}
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            <strong>Black:</strong> {gameState.blackPlayer?.name || 'Black'}
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            <strong>Time Control:</strong> {Math.floor(gameState.whiteTime / 60)}+{gameState.increment}
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            <strong>Status:</strong> {gameState.status}
          </Typography>
          
          {gameState.status === 'finished' && (
            <Typography variant="body1" gutterBottom>
              <strong>Result:</strong> {gameState.outcome}
            </Typography>
          )}
        </Paper>
      </Grid>
      
      {/* Draw offer dialog */}
      <Dialog
        open={drawDialogOpen}
        onClose={handleDeclineDraw}
      >
        <DialogTitle>Draw Offer</DialogTitle>
        <DialogContent>
          <Typography>
            {drawOfferedBy === 'w' ? 'White' : 'Black'} offers a draw. Do you accept?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeclineDraw} color="primary">
            Decline
          </Button>
          <Button onClick={handleAcceptDraw} color="primary" autoFocus>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}

export default ChessBoard;
