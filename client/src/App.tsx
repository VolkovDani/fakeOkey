import './App.css';
import { useWebSocket } from './hooks/useWebSocket';
import LobbyScreen from './components/LobbyScreen';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';

function App() {
  const {
    gameState,
    connected,
    roomId,
    players,
    error,
    roundScores,
    totalScores,
    sendMessage,
  } = useWebSocket('ws://localhost:3001');

  if (!connected) {
    return <div className="connecting">Connecting...</div>;
  }

  return (
    <div className="app">
      {error && <div className="error-banner">{error}</div>}

      {(!gameState || gameState.phase === 'lobby') && (
        <LobbyScreen
          roomId={roomId}
          players={players}
          sendMessage={sendMessage}
        />
      )}

      {gameState?.phase === 'playing' && (
        <GameBoard gameState={gameState} sendMessage={sendMessage} />
      )}

      {gameState?.phase === 'round_end' && (
        <ScoreBoard
          scores={roundScores}
          totalScores={totalScores}
          players={gameState.players}
          isFinal={false}
        />
      )}

      {gameState?.phase === 'game_over' && (
        <ScoreBoard
          scores={roundScores}
          totalScores={totalScores}
          players={gameState.players}
          isFinal={true}
        />
      )}
    </div>
  );
}

export default App;
