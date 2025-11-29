import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Game } from '../types/game';
import './GameLobby.css';

// Helper to get initial values from URL
const getInitialGameCode = () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  return code ? code.toUpperCase() : '';
};

const getInitialMode = (): 'create' | 'join' | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('code') ? 'join' : null;
};

interface GameLobbyProps {
  game: Game | null;
  isConnected: boolean;
  error: string | null;
  onCreateGame: (playerName: string) => void;
  onJoinGame: (gameCode: string, playerName: string) => void;
  onClearError: () => void;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  game,
  isConnected,
  error,
  onCreateGame,
  onJoinGame,
  onClearError,
}) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('playerName') || '');
  const [gameCode, setGameCode] = useState(getInitialGameCode);
  const [mode, setMode] = useState<'create' | 'join' | null>(getInitialMode);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    }
  }, [playerName]);

  useEffect(() => {
    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleCreateGame = () => {
    if (playerName.trim()) {
      onCreateGame(playerName.trim());
    }
  };

  const handleJoinGame = () => {
    if (playerName.trim() && gameCode.trim()) {
      onJoinGame(gameCode.trim().toUpperCase(), playerName.trim());
    }
  };

  const handleCopyCode = () => {
    if (game?.gameCode) {
      navigator.clipboard.writeText(game.gameCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getShareUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}?code=${game?.gameCode}`;
  };

  if (!isConnected) {
    return (
      <div className="lobby-container">
        <div className="connection-status">
          <div className="spinner"></div>
          <p>Connecting to game server...</p>
        </div>
      </div>
    );
  }

  // Waiting for player 2
  if (game && game.state === 'WaitingForPlayer') {
    return (
      <div className="lobby-container">
        <div className="waiting-screen">
          <h2>Game Created!</h2>
          <p>Share this code with your friend:</p>
          
          <div className="game-code-display">
            <span className="game-code">{game.gameCode}</span>
            <button className="copy-btn" onClick={handleCopyCode}>
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="qr-section">
            <p>Or scan this QR code:</p>
            <div className="qr-container">
              <QRCodeSVG 
                value={getShareUrl()} 
                size={200}
                level="M"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="share-link">
            <p>Direct link:</p>
            <input type="text" readOnly value={getShareUrl()} onClick={(e) => (e.target as HTMLInputElement).select()} />
          </div>

          <div className="waiting-indicator">
            <div className="spinner"></div>
            <p>Waiting for opponent to join...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lobby-container">
      <h1>SignalR Checkers</h1>
      <p className="subtitle">Play live checkers with friends</p>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={onClearError}>×</button>
        </div>
      )}

      <div className="name-input">
        <label htmlFor="playerName">Your Name:</label>
        <input
          id="playerName"
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          maxLength={20}
        />
      </div>

      {!mode && (
        <div className="mode-selection">
          <button 
            className="mode-btn create-btn"
            onClick={() => setMode('create')}
            disabled={!playerName.trim()}
          >
            Create New Game
          </button>
          <span className="or-divider">OR</span>
          <button 
            className="mode-btn join-btn"
            onClick={() => setMode('join')}
            disabled={!playerName.trim()}
          >
            Join Existing Game
          </button>
        </div>
      )}

      {mode === 'create' && (
        <div className="create-section">
          <button className="back-btn" onClick={() => setMode(null)}>← Back</button>
          <h2>Create New Game</h2>
          <p>You'll get a code to share with your friend.</p>
          <button 
            className="action-btn"
            onClick={handleCreateGame}
            disabled={!playerName.trim()}
          >
            Create Game
          </button>
        </div>
      )}

      {mode === 'join' && (
        <div className="join-section">
          <button className="back-btn" onClick={() => setMode(null)}>← Back</button>
          <h2>Join Game</h2>
          <div className="code-input">
            <label htmlFor="gameCode">Enter Game Code:</label>
            <input
              id="gameCode"
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="XXXXXX"
              maxLength={6}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <button 
            className="action-btn"
            onClick={handleJoinGame}
            disabled={!playerName.trim() || !gameCode.trim()}
          >
            Join Game
          </button>
        </div>
      )}
    </div>
  );
};
