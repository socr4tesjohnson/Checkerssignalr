import { useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import type { Game, Move } from '../types/game';

interface UseSignalRReturn {
  isConnected: boolean;
  game: Game | null;
  error: string | null;
  createGame: (playerName: string) => Promise<void>;
  joinGame: (gameCode: string, playerName: string) => Promise<void>;
  makeMove: (move: Move) => Promise<void>;
  clearError: () => void;
}

const showNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/pwa-192x192.png' });
  }
};

export const useSignalR = (): UseSignalRReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const hubUrl = import.meta.env.PROD 
      ? '/checkershub' 
      : 'http://localhost:5000/checkershub';

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    connectionRef.current = newConnection;

    // Set up event handlers
    newConnection.on('GameCreated', (gameData: Game) => {
      setGame(gameData);
      setError(null);
    });

    newConnection.on('GameJoined', (gameData: Game) => {
      setGame(gameData);
      setError(null);
    });

    newConnection.on('GameStarted', (gameData: Game) => {
      setGame(gameData);
      showNotification('Game Started!', `${gameData.player2Name} has joined the game!`);
    });

    newConnection.on('GameUpdated', (gameData: Game) => {
      setGame(gameData);
      if (gameData.currentPlayer === gameData.yourPlayerNumber) {
        showNotification('Your Turn!', "It's your turn to move.");
      }
    });

    newConnection.on('GameOver', (winner: number) => {
      setGame(prev => prev ? { ...prev, winner, state: 'Completed' } : null);
      showNotification('Game Over!', `Player ${winner} wins!`);
    });

    newConnection.on('JoinFailed', (errorMessage: string) => {
      setError(errorMessage);
    });

    newConnection.on('MoveFailed', (errorMessage: string) => {
      setError(errorMessage);
    });

    newConnection.on('PlayerDisconnected', () => {
      setError('The other player has disconnected');
    });

    newConnection.on('GameNotFound', () => {
      setError('Game not found');
    });

    // Start connection
    newConnection
      .start()
      .then(() => {
        setIsConnected(true);
        setError(null); // Clear any previous errors on successful connection
        console.log('SignalR Connected');
      })
      .catch((err) => {
        console.error('SignalR Connection Error:', err);
        // Only show error if we're not connected (ignore transient errors during negotiation)
        if (newConnection.state !== signalR.HubConnectionState.Connected) {
          setError('Failed to connect to game server');
        }
      });

    newConnection.onclose(() => {
      setIsConnected(false);
    });

    newConnection.onreconnecting(() => {
      setIsConnected(false);
    });

    newConnection.onreconnected(() => {
      setIsConnected(true);
      setError(null); // Clear error on successful reconnection
    });

    return () => {
      newConnection.stop();
    };
  }, []);

  const createGame = useCallback(async (playerName: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('CreateGame', playerName);
      } catch (err) {
        setError('Failed to create game');
        console.error('CreateGame error:', err);
      }
    } else {
      setError('Not connected to server');
    }
  }, []);

  const joinGame = useCallback(async (gameCode: string, playerName: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      try {
        await connectionRef.current.invoke('JoinGame', gameCode, playerName);
      } catch (err) {
        setError('Failed to join game');
        console.error('JoinGame error:', err);
      }
    } else {
      setError('Not connected to server');
    }
  }, []);

  const makeMove = useCallback(async (move: Move) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected && game) {
      try {
        await connectionRef.current.invoke('MakeMove', game.gameId, move);
      } catch (err) {
        setError('Failed to make move');
        console.error('MakeMove error:', err);
      }
    } else {
      setError('Not connected to server');
    }
  }, [game]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isConnected,
    game,
    error,
    createGame,
    joinGame,
    makeMove,
    clearError,
  };
};
