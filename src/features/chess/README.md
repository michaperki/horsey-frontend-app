# Chess Feature

This module contains the newer in-house chess experience for Horsey. It sits alongside the older Lichess-powered betting flow and is intended to support games that can be played, timed, observed, and settled directly inside the app.

The frontend uses React components for the board and game pages. The backend uses `chess.js`, MongoDB `Game` documents, and Socket.io game rooms for move validation, clock updates, game-over events, and bet settlement.

## Components

### Main Pieces

- `ChessBoard.jsx` renders the board and pieces.
- `ChessClock.jsx` displays player clocks.
- `GamePage.jsx` and `ChessGamePage.jsx` host playable game views.
- `BetChessGame.jsx` connects a playable chess game to an accepted bet.
- `StandaloneChessboard.jsx` and standalone pages provide isolated/dev test surfaces.

Backend counterparts:
- `backend/models/Game.js` stores board state, clocks, players, outcome, and optional `betId`.
- `backend/routes/game.js` exposes game actions such as start, move, resign, draw, state, and history.
- `backend/socket/setupGameHandlers.js` handles real-time joins, moves, clocks, timeouts, resignations, draw flow, and bet outcome processing.
- `backend/services/chessService.js` creates in-house games and reads outcomes for bet settlement.

## Usage

```jsx
import { StandaloneChessboard } from './features/chess/components';

function MyComponent() {
  const handleMove = (move) => {
    console.log('Move made:', move);
  };

  return (
    <StandaloneChessboard 
      timeControl={600} // 10 minutes in seconds
      increment={5} // 5 second increment
      onMove={handleMove}
    />
  );
}
```

## Routes

Current frontend routes include:

- `/chess` and `/chess/standalone` for standalone chess views
- `/chess/play` for play/development entry
- `/game/:gameId` and `/chess/game/:gameId` for game pages
- `/chess/bet/:gameId` for bet-connected games

## Development Mode

For development, the standalone pages can be mounted directly:

```jsx
import { StandaloneChessPage } from './features/chess/pages';

function App() {
  return (
    <Routes>
      <Route path="/chess" element={<StandaloneChessPage />} />
    </Routes>
  );
}
```

Development mode includes:
- Auto-play functionality for testing
- Debug logging
- Easy toggle between dev and production modes

## Implementation Details

The in-house chess direction currently combines:

1. React-rendered chess boards and controls on the frontend.
2. `chess.js` validation and game-state persistence on the backend.
3. Socket.io events for low-latency board and clock updates.
4. MongoDB `Game` records for durable state and settlement.
5. SVG pieces from the public folder.
6. Responsive board styles for different screen sizes.

Important note: this module is still mid-integration. Some standalone components use local/mock state for development, while production bet-connected games should rely on backend game state and socket events.

## Styles

The component comes with its own CSS that can be customized by overriding the classes:
- `.standalone-chess` - The main container
- `.chessboard` - The chess board grid
- `.square` - Individual squares on the board
- `.piece` - Chess pieces
- `.controls` - Game control buttons
