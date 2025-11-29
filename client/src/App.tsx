import { useSignalR } from './hooks/useSignalR';
import { GameLobby } from './components/GameLobby';
import { CheckerBoard } from './components/CheckerBoard';
import './App.css';

function App() {
  const {
    isConnected,
    game,
    error,
    createGame,
    joinGame,
    makeMove,
    clearError,
  } = useSignalR();

  // Show game board when game is in progress or completed
  const showGame = game && (game.state === 'InProgress' || game.state === 'Completed');

  return (
    <div className="app">
      {showGame ? (
        <CheckerBoard game={game} onMove={makeMove} />
      ) : (
        <GameLobby
          game={game}
          isConnected={isConnected}
          error={error}
          onCreateGame={createGame}
          onJoinGame={joinGame}
          onClearError={clearError}
        />
      )}
    </div>
  );
}

export default App;
