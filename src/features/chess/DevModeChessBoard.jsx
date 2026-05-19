// src/features/chess/DevModeChessBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { DevModeSocketProvider, useDevModeSocket } from './mocks/DevModeSocketProvider';
import { DevModeAuthProvider } from './mocks/ContextOverride';
import ChessBoard from './ChessBoard';
import { Button, Box, FormControl, InputLabel, Select, MenuItem, Grid, TextField, Typography, Card, CardContent, Switch, FormControlLabel } from '@mui/material';
import devConfig from './mocks/config';

/**
 * Developer control panel for the chess board
 */
const ChessBoardControls = () => {
  const socket = useDevModeSocket();
  const [position, setPosition] = useState('');
  const [timeControl, setTimeControl] = useState(devConfig.defaultTimeControl);
  const [increment, setIncrement] = useState(devConfig.defaultIncrement);

  const handleReset = () => {
    socket._dev.resetGame({
      timeControl,
      increment
    });
  };

  const handleSetPosition = () => {
    if (position.trim()) {
      socket._dev.setPosition(position);
    }
  };

  const handleSwitchSides = () => {
    socket._dev.togglePlayerColor();
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, bgcolor: '#272727' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Chess Developer Tools
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={6} md={3}>
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
            
            <Grid item xs={6} md={3}>
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
          </Grid>
        </Box>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              label="FEN Position"
              variant="outlined"
              fullWidth
              size="small"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Enter FEN to set position"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleReset}
                fullWidth
              >
                Reset Game
              </Button>
              <Button 
                variant="outlined"
                onClick={handleSwitchSides}
                fullWidth
              >
                Switch Sides
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleSetPosition}
                disabled={!position.trim()}
                fullWidth
              >
                Set Position
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/**
 * Chess board wrapper that works in development mode
 * without requiring server connection or authentication
 */
const DevModeChessBoard = () => {
  // Generate a random but deterministic game ID
  const gameIdRef = useRef(`dev-game-${Math.floor(Math.random() * 10000)}`);
  const socketRef = useRef(null);
  
  // Initialize the game when the component mounts
  useEffect(() => {
    // Short delay to ensure socket provider is ready
    const timer = setTimeout(() => {
      if (socketRef.current) {
        console.log('Creating dev mode chess game:', gameIdRef.current);
        
        // Create a new game with specific ID instead of just joining
        // This ensures the game is created properly in the dev mode provider
        socketRef.current.emit('createChessGame', { 
          gameId: gameIdRef.current,
          timeControl: devConfig.defaultTimeControl,
          increment: devConfig.defaultIncrement
        });
        
        // Add a listener for the gameCreated event
        socketRef.current.on('gameCreated', (data) => {
          console.log('Game created successfully:', data);
          
          // Now join the game we just created
          socketRef.current.emit('joinChessGame', { 
            gameId: data.gameId || gameIdRef.current 
          });
        });
        
        // Handle any errors
        socketRef.current.on('gameError', (error) => {
          console.error('Error creating/joining game:', error);
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <DevModeSocketProvider>
      {socket => {
        // Store the socket for initialization
        socketRef.current = socket;
        
        return (
          <DevModeAuthProvider>
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
              <Typography variant="h4" gutterBottom>
                Chess Game Development Mode
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                This is a development mode for testing the chess game interface without requiring server connection, authentication, or multiple users.
                You can play as both sides, reset the game, and set custom positions.
              </Typography>
              
              <ChessBoardControls />
              
              <Box sx={{ position: 'relative' }}>
                {/* We use the actual ChessBoard component but with our mocked context providers */}
                <ChessBoard gameId={gameIdRef.current} />
              </Box>
            </Box>
          </DevModeAuthProvider>
        );
      }}
    </DevModeSocketProvider>
  );
};

// This component is no longer needed since we're using DevModeAuthProvider
// from the ContextOverride module instead
export const MockAuthProvider = ({ children }) => {
  return children;
};

// Wrap the ChessBoard with appropriate context providers for auth and socket
const WithDevModeProvider = () => {
  return <DevModeChessBoard />;
};

export default devConfig.enableDevMode ? WithDevModeProvider : ChessBoard;