// src/features/chess/pages/ChessTestPage.jsx
import React from 'react';
import DevModeChessBoard from '../DevModeChessBoard';
import { Box, Paper, Typography, Link, Divider } from '@mui/material';
import { useAuth } from '../../auth/contexts/AuthContext';
import { DevModeAuthProvider } from '../mocks/ContextOverride';

/**
 * A standalone page for testing the chess interface
 * No authentication or server connection required
 */
const ChessTestPage = () => {
  return (
    <DevModeAuthProvider>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Chess Board Testing Environment
        </Typography>
      
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#272727' }}>
        <Typography variant="h6" gutterBottom>
          Developer Guide
        </Typography>
        
        <Typography variant="body2" paragraph>
          This page provides a standalone environment for testing and developing the chess interface without
          requiring authentication, Lichess accounts, or server connections.
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          Features:
        </Typography>
        
        <ul>
          <li>
            <Typography variant="body2">
              Play as both white and black - moves on either side are automatically accepted
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Set custom board positions with FEN notation for testing specific scenarios
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Test time controls and clock functionality
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Test game-ending conditions (checkmate, stalemate, draw offers, resignation)
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              Reset the game at any time to start over
            </Typography>
          </li>
        </ul>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Useful FEN positions for testing:
        </Typography>
        
        <Box component="ul" sx={{ '& .MuiLink-root': { fontSize: '0.875rem' } }}>
          <li>
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigator.clipboard.writeText('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')}
            >
              Starting Position
            </Link>
          </li>
          <li>
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigator.clipboard.writeText('r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4')}
            >
              Scholar's Mate
            </Link>
          </li>
          <li>
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigator.clipboard.writeText('8/8/8/8/8/4k3/R7/4K3 b - - 0 1')}
            >
              Stalemate Position
            </Link>
          </li>
          <li>
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigator.clipboard.writeText('k7/8/8/8/8/8/R7/K7 b - - 0 1')}
            >
              Checkmate in One
            </Link>
          </li>
          <li>
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigator.clipboard.writeText('rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 2')}
            >
              After 1...f5
            </Link>
          </li>
        </Box>
      </Paper>
      
      {/* Wrap DevModeChessBoard with our mocked context providers */}
      <DevModeChessBoard />
    </Box>
    </DevModeAuthProvider>
  );
};

export default ChessTestPage;