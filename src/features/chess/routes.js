// src/features/chess/routes.js
import ChessTestPage from './pages/ChessTestPage';

// Define chess-related routes
const chessRoutes = [
  {
    path: '/chess/test',
    element: <ChessTestPage />,
    // No auth required for the test page
  }
];

export default chessRoutes;