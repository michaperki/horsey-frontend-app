// src/features/chess/pages/PlayChessPage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Tabs, Tab, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { DevModeSocketProvider } from '../mocks/DevModeSocketProvider';
import { DevModeAuthProvider } from '../mocks/ContextOverride';
import DevModeChessBoard from '../DevModeChessBoard';
import ChessBoard from '../ChessBoard';
import StandaloneChessBoard from '../standalone/StandaloneChessBoard';
import { ChessProvider } from '../contexts/ChessContext';

// Disable any real socket.io connections when in standalone mode
// This is needed to prevent "Game not found" errors from the real backend
const disableRealSockets = () => {
  const originalConnect = window.WebSocket;
  
  // Only patch if we're in standalone mode and haven't patched already
  if (window.location.search.includes('standalone=true') && !window._socketsDisabled) {
    console.log('[Chess] Disabling real WebSocket connections for standalone mode');
    
    // Create a mock WebSocket that does nothing
    window.WebSocket = function MockWebSocket(url) {
      console.log('[Chess] Blocked WebSocket connection to:', url);
      this.send = () => {};
      this.close = () => {};
      
      // Simulate connection failure after a short delay
      setTimeout(() => {
        if (this.onerror) this.onerror(new Error('Connections disabled in standalone mode'));
        if (this.onclose) this.onclose({ code: 1000, reason: 'Standalone mode enabled' });
      }, 100);
      
      return this;
    };
    
    window._socketsDisabled = true;
  }
  
  return () => {
    // Restore original WebSocket if needed
    if (window._socketsDisabled) {
      window.WebSocket = originalConnect;
      window._socketsDisabled = false;
    }
  };
};

/**
 * A standalone page for playing chess without requiring Lichess integration
 */
const PlayChessPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [gameMode, setGameMode] = useState('local');
  const [timeControl, setTimeControl] = useState(10);
  const [increment, setIncrement] = useState(5);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Enable standalone mode if specified in URL
  useEffect(() => {
    const isStandaloneMode = window.location.search.includes('standalone=true');
    setIsStandalone(isStandaloneMode);
    
    // Disable real WebSocket connections if in standalone mode
    if (isStandaloneMode) {
      const cleanup = disableRealSockets();
      return cleanup;
    }
  }, []);

  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateGame = () => {
    console.log('Creating game with settings:', { gameMode, timeControl, increment });
    // In a real implementation, this would create an actual game
    // For now, we just switch to the dev mode board
    setActiveTab(1);
  };

  return (
    <DevModeAuthProvider>
      <ChessProvider>
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Chess
          </Typography>
          
          {isStandalone && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Running in standalone mode. No server connection required.
            </Alert>
          )}
          
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Create Game" />
            <Tab label="Play" />
            <Tab label="Game History" />
          </Tabs>
          
          {activeTab === 0 && (
            <Paper sx={{ p: 3, bgcolor: '#272727' }}>
              <Typography variant="h6" gutterBottom>
                Create a New Game
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                  <InputLabel>Game Mode</InputLabel>
                  <Select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value)}
                    label="Game Mode"
                  >
                    <MenuItem value="local">Play Locally (Same Device)</MenuItem>
                    <MenuItem value="computer">Play vs Computer</MenuItem>
                    <MenuItem value="friend">Create Game Link for Friend</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl variant="outlined" sx={{ mb: 2, mr: 2, width: 180 }}>
                  <InputLabel>Time Control</InputLabel>
                  <Select
                    value={timeControl}
                    onChange={(e) => setTimeControl(e.target.value)}
                    label="Time Control"
                  >
                    <MenuItem value={1}>1 minute</MenuItem>
                    <MenuItem value={3}>3 minutes</MenuItem>
                    <MenuItem value={5}>5 minutes</MenuItem>
                    <MenuItem value={10}>10 minutes</MenuItem>
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl variant="outlined" sx={{ mb: 2, width: 180 }}>
                  <InputLabel>Increment</InputLabel>
                  <Select
                    value={increment}
                    onChange={(e) => setIncrement(e.target.value)}
                    label="Increment"
                  >
                    <MenuItem value={0}>0 seconds</MenuItem>
                    <MenuItem value={1}>1 second</MenuItem>
                    <MenuItem value={2}>2 seconds</MenuItem>
                    <MenuItem value={5}>5 seconds</MenuItem>
                    <MenuItem value={10}>10 seconds</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleCreateGame}
                size="large"
              >
                Create Game
              </Button>
            </Paper>
          )}
          
          {activeTab === 1 && (
            <Box>
              {/* Use the completely standalone chess board instead of DevModeChessBoard */}
              <StandaloneChessBoard />
            </Box>
          )}
          
          {activeTab === 2 && (
            <Paper sx={{ p: 3, bgcolor: '#272727' }}>
              <Typography variant="h6" gutterBottom>
                Game History
              </Typography>
              
              <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                Your completed games will appear here.
              </Typography>
            </Paper>
          )}
        </Box>
      </ChessProvider>
    </DevModeAuthProvider>
  );
};

export default PlayChessPage;