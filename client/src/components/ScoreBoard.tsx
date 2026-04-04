import { type PlayerState } from 'shared/types';

interface ScoreBoardProps {
  scores: Record<string, number> | null;
  totalScores: Record<string, number> | null;
  players: PlayerState[];
  isFinal: boolean;
  onContinue?: () => void;
}

export default function ScoreBoard({ scores, totalScores, players, isFinal, onContinue }: ScoreBoardProps) {
  // Find winner (lowest total score)
  let winnerId: string | null = null;
  if (isFinal && totalScores) {
    let lowestScore = Infinity;
    for (const [id, score] of Object.entries(totalScores)) {
      if (score < lowestScore) {
        lowestScore = score;
        winnerId = id;
      }
    }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    const aTotal = totalScores?.[a.id] ?? 0;
    const bTotal = totalScores?.[b.id] ?? 0;
    return aTotal - bTotal;
  });

  const cardStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  };

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    opacity: 0.6,
    fontWeight: 600,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  };

  const numStyle: React.CSSProperties = {
    ...tdStyle,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '24px',
    }}>
      <div style={cardStyle}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '8px',
          fontSize: isFinal ? '2rem' : '1.5rem',
          fontWeight: 700,
        }}>
          {isFinal ? 'Game Over!' : 'Round End'}
        </h2>
        {isFinal && winnerId && (
          <div style={{
            textAlign: 'center',
            marginBottom: '24px',
            color: '#ffd54f',
            fontSize: '1.1rem',
          }}>
            Winner: {players.find((p) => p.id === winnerId)?.name ?? winnerId}
          </div>
        )}
        {!isFinal && (
          <div style={{ marginBottom: '24px' }} />
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>Player</th>
              {scores && <th style={{ ...thStyle, textAlign: 'right' }}>Round</th>}
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player) => {
              const isWinner = player.id === winnerId;
              const roundScore = scores?.[player.id];
              const totalScore = totalScores?.[player.id];

              return (
                <tr
                  key={player.id}
                  style={{
                    background: isWinner ? 'rgba(255,215,0,0.1)' : 'transparent',
                  }}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isWinner && (
                        <span style={{ fontSize: '1rem' }}>*</span>
                      )}
                      <span style={{ fontWeight: isWinner ? 700 : 400 }}>
                        {player.name}
                      </span>
                      {isWinner && (
                        <span style={{
                          fontSize: '0.7rem',
                          background: '#ffd54f',
                          color: '#000',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontWeight: 700,
                        }}>
                          WIN
                        </span>
                      )}
                    </div>
                  </td>
                  {scores && (
                    <td style={{
                      ...numStyle,
                      color: roundScore !== undefined && roundScore < 0 ? '#a5d6a7' : '#ef9a9a',
                    }}>
                      {roundScore !== undefined ? (roundScore > 0 ? `+${roundScore}` : String(roundScore)) : '-'}
                    </td>
                  )}
                  <td style={{
                    ...numStyle,
                    color: isWinner ? '#ffd54f' : '#fff',
                  }}>
                    {totalScore ?? '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!isFinal && (
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={onContinue}
              style={{
                padding: '12px 32px',
                borderRadius: '8px',
                border: 'none',
                background: '#2e7d32',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Next Round
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
