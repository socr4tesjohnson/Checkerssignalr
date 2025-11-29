# SignalR Checkers

A real-time multiplayer checkers game built with ASP.NET Core SignalR and React. Play live checkers with friends by sharing a game code or QR code!

## Features

- **Real-time Multiplayer**: Play checkers live with another player using SignalR for instant communication
- **Game Code Sharing**: Create a game and share a 6-character code with your friend
- **QR Code Support**: Scan a QR code to quickly join a game on mobile devices
- **Progressive Web App (PWA)**: Install the app on your device for offline access and notifications
- **Push Notifications**: Get notified when it's your turn or when a player joins
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

### Backend
- ASP.NET Core 10
- SignalR for real-time communication
- In-memory game state management

### Frontend
- React 19 with TypeScript
- Vite for fast development and building
- vite-plugin-pwa for PWA support
- qrcode.react for QR code generation
- @microsoft/signalr client library

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- npm

### Running the Backend

```bash
cd CheckersApi
dotnet run
```

The API will start on http://localhost:5000

### Running the Frontend (Development)

```bash
cd client
npm install
npm run dev
```

The frontend will start on http://localhost:5173 and proxy SignalR requests to the backend.

### Building for Production

```bash
# Build frontend
cd client
npm run build

# Copy build to backend's wwwroot
cp -r dist/* ../CheckersApi/wwwroot/

# Build and run backend
cd ../CheckersApi
dotnet run --configuration Release
```

## How to Play

1. **Create a Game**: Enter your name and click "Create New Game"
2. **Share the Code**: Share the 6-character game code or QR code with your friend
3. **Join a Game**: Your friend enters the code or scans the QR code to join
4. **Play Checkers**: 
   - Red (Player 1) moves first
   - Click a piece to select it, then click a valid destination
   - Capture opponent pieces by jumping over them
   - Reach the opposite end to become a King
   - Kings can move both forward and backward
   - Win by capturing all opponent pieces

## Game Rules

- Standard American Checkers rules
- Pieces move diagonally on dark squares
- Regular pieces can only move forward
- Kings can move forward and backward
- Captures are made by jumping over opponent pieces
- Multi-jump captures are allowed

## PWA Installation

On supported browsers, you can install the app:
- **Chrome/Edge**: Click the install icon in the address bar
- **Safari iOS**: Tap Share → Add to Home Screen
- **Firefox Android**: Tap the menu → Install

## License

MIT License