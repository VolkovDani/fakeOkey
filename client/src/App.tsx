import './App.css';
import { useWebSocket } from './hooks/useWebSocket';
import { useI18n } from './i18n';
import LobbyScreen from './components/LobbyScreen';
import GameBoard from './components/GameBoard';
import ScoreBoard from './components/ScoreBoard';
import LanguageSwitcher from './components/LanguageSwitcher';
import DisconnectOverlay from './components/DisconnectOverlay';

function App() {
  const { t } = useI18n();
  const {
    gameState,
    connected,
    roomId,
    players,
    error,
    roundScores,
    totalScores,
    disconnectInfo,
    sendMessage,
  } = useWebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`);

  if (!connected) {
    return (
      <>
        <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 100 }}>
          <LanguageSwitcher />
        </div>
        <div className="connecting">{t('connecting')}</div>
      </>
    );
  }

  const errorText = error === 'connection_error' ? t('connectionError') : error;

  return (
    <div className="app">
      <div style={{ position: 'fixed', top: 12, left: 12, zIndex: 100 }}>
        <LanguageSwitcher />
      </div>
      {errorText && <div className="error-banner">{errorText}</div>}

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

      {disconnectInfo && <DisconnectOverlay info={disconnectInfo} />}
    </div>
  );
}

export default App;
