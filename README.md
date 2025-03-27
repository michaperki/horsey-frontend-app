# Horsey Frontend

## Make the game a little more interesting

Horsey is a chess betting platform that allows users to place wagers on chess games through Lichess integration. This README covers the setup, architecture, testing, and key components of the frontend application.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Setup Instructions](#setup-instructions)
3. [Architecture](#architecture)
4. [Key Features](#key-features)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)
8. [Future Improvements](#future-improvements)

## Project Overview

Horsey enables users to:
- Connect their Lichess accounts
- Place bets on chess games with various parameters
- Compete with other players for tokens
- Track betting history and performance
- Purchase tokens through the in-app store

The project follows a feature-based structure where code is organized by domain functionality:

```
frontend/
├── public/              # Static assets
├── src/
│   ├── features/        # Feature modules
│   │   ├── admin/       # Admin functionality
│   │   ├── auth/        # Authentication
│   │   ├── betting/     # Betting functionality
│   │   ├── common/      # Shared utilities
│   │   ├── home/        # Home page
│   │   ├── info/        # Informational pages
│   │   ├── landing/     # Landing page
│   │   ├── layout/      # Layout components
│   │   ├── leaderboard/ # Leaderboard page
│   │   ├── lobby/       # Lobby page
│   │   ├── notifications/ # Notifications
│   │   ├── profile/     # User profile
│   │   ├── store/       # Store for token purchases
│   │   └── token/       # Token management
│   ├── services/        # Global services
│   ├── styles/          # Global styles
│   ├── App.js           # Main App component
│   └── index.js         # Entry point
├── cypress/             # End-to-end tests
├── package.json         # Dependencies and scripts
└── README.md            # Project info
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- npm (v6+) or yarn
- Backend server (separate repository)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/horsey.git
   cd horsey/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

5. The application should now be running at `http://localhost:3000`

## Architecture

### Core Technologies
- React 18 for UI components
- React Router for navigation
- Context API for state management
- Framer Motion for animations
- Socket.io for real-time updates
- Axios for API requests
- Jest and React Testing Library for unit tests
- Cypress for end-to-end tests

### State Management
The application uses React Context API for state management with several key contexts:
- `AuthContext`: Manages user authentication state
- `TokenContext`: Manages token balances
- `SelectedTokenContext`: Manages the selected token type
- `LichessContext`: Manages Lichess account connections
- `NotificationsContext`: Manages user notifications
- `ProfileContext`: Manages user profile data
- `SocketContext`: Manages Socket.io connections

### Key Components

#### Layout Components
- `Layout.js`: Main layout wrapper for authenticated pages
- `Navbar.js`: Navigation bar with user info and links
- `Sidebar.js`: Right sidebar with ads and quick actions
- `StatCard.js`: Reusable component for displaying statistics

#### Authentication Components
- `Register.js`: User registration form
- `UserLogin.js`: User login form
- `AdminLogin.js`: Admin login form
- `LichessCallback.js`: Handles Lichess OAuth callback
- `ProtectedRoute.js`: Route protection HOC

#### Betting Components
- `PlaceBet.js`: Button to open betting modal
- `PlaceBetModal.js`: Modal for creating a new bet
- `AvailableBets.js`: Shows available bets from other users
- `YourBets.js`: Shows the user's bet history

#### Profile Components
- `ProfileHeader.js`: Header for the profile page
- `VerticalTabs.js`: Tab navigation for profile page
- `LichessInfo.js`: Displays Lichess account information
- `History.js`: Displays user's betting history

#### Store Components
- `Store.js`: Main store component
- `ProductCard.js`: Card for displaying a product
- `CategorySection.js`: Groups products by category

#### Notification Components
- `Notifications.js`: Displays user notifications
- `NotificationsModal.js`: Shows real-time notification popups

#### Token Components
- `BalanceToggle.js`: Displays and toggles between token types

## Key Features

### Authentication
- User registration and login
- Admin login with protected routes
- JWT token management with automatic expiration handling

### Lichess Integration
- OAuth-based Lichess account connection
- Fetching player ratings and game data
- Managing chess games through the Lichess API

### Betting System
- Creating bets with various parameters:
  - Color preference (white, black, random)
  - Time control (e.g., 5|3, 3|2)
  - Game variant (Standard, Crazyhouse, Chess960)
  - Wager amount
  - Currency type (tokens or sweepstakes)
- Accepting bets from other users
- Viewing bet history
- Real-time updates when bets are accepted

### Token System
- Multiple token types (Player Tokens and Sweepstakes Tokens)
- Token purchasing through the store
- Balance display and management

### Social Features
- Leaderboard with player rankings
- Notifications system
- Profile pages with user stats

## Testing

### Unit Tests
The project uses Jest and React Testing Library for component and utility testing.

Run tests with:
```bash
npm test
# or
yarn test
```

### End-to-End Tests
Cypress is used for end-to-end testing with two configurations:
- Standard tests with mocked Lichess interactions
- Real integration tests with actual Lichess connectivity

#### Running Cypress Tests
1. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

2. Run Cypress tests with UI:
   ```bash
   npm run cypress:open
   # or
   yarn cypress:open
   ```

3. Run Cypress tests headlessly:
   ```bash
   npm run cypress:run
   # or
   yarn cypress:run
   ```

4. Run real Lichess integration tests:
   ```bash
   npm run cypress:real
   # or
   yarn cypress:real
   ```

#### Key Cypress Commands
The project includes custom Cypress commands in `cypress/support/commands.js`:

- `cy.login(email, password)`: Log in a user via the UI
- `cy.loginAsAdmin()`: Log in as admin and store token
- `cy.logout()`: Log out a user
- `cy.resetDatabaseAndSeedAdmin()`: Reset test database and create admin user
- `cy.registerUser(username, email, password)`: Register a new user
- `cy.setLichessAccessToken(email, token)`: Set Lichess token for a user
- `cy.mockLichessForUser(userId)`: Mock Lichess API responses for a user
- `cy.mockLichessFlowForUser(userId, connected)`: Mock Lichess connection state
- `cy.verifyBalance(expectedBalance)`: Verify user balance on profile page

### Database Population
For testing purposes, the API provides endpoints to reset and seed the database:

```bash
# Reset database and create admin user
curl -X POST http://localhost:5000/test/reset-and-seed-admin

# Set Lichess token for a user
curl -X POST http://localhost:5000/test/set-lichess-token \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","lichessAccessToken":"token123"}'

# Conclude a test game
curl -X POST http://localhost:5000/test/conclude-game \
  -H "Content-Type: application/json" \
  -d '{"gameId":"game123","outcome":"white"}'
```

## Deployment

The frontend is configured for deployment to various platforms:

### Netlify Deployment
The `_redirects` file in the public directory is configured for Netlify deployments, handling both client-side routing and API proxying:

```
/*    /index.html   200
/auth/* https://horsey-dd32bf69ae0e.herokuapp.com/auth/:splat 200
```

### General Deployment Steps
1. Build the production-ready application:
   ```bash
   npm run build
   # or
   yarn build
   ```

2. Deploy the generated `build` directory to your hosting provider.

3. Ensure environment variables are properly set in your hosting environment.

## Troubleshooting

### Common Issues and Solutions

#### API Connection Issues
- **CORS Errors**: Ensure the backend has CORS enabled for your frontend URL
- **404 Not Found**: Verify the API URL is correct in `.env` and the backend is running
- **Network Request Failed**: Check if the backend server is running and network connectivity

#### Authentication Issues
- **Token Expiration**: Check token expiration logic in `AuthContext.js`
- **Invalid Credentials**: Verify user exists in the database and credentials are correct

#### Lichess Integration Issues
- **OAuth Callback Fails**: Ensure callback URL is correctly set in Lichess OAuth settings
- **Cannot Connect to Lichess**: Check browser console for errors and verify OAuth flow

#### Testing Issues
- **Jest Tests Failing**: Update snapshots if UI components have changed with `npm test -- -u`
- **Cypress Test Failures**: Run in interactive mode with `npm run cypress:open` to debug

#### Build/Deployment Issues
- **Build Failures**: Check for environment-specific code that might not work in production
- **Routing Issues**: Ensure hosting provider is configured for single-page applications

## Future Improvements

- Implement "Sit & Go" tournaments (currently shown as "Coming Soon")
- Add more tournament options and game variants
- Implement a friends system
- Enhance the notification system
- Add TypeScript for better type safety
- Improve test coverage
- Implement optimistic UI updates
- Add service workers for offline capabilities
- Optimize image loading and bundle size

## License

Copyright © 2023-2025. All rights reserved.