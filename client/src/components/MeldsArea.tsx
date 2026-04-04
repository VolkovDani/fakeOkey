import { type PlayerState, type TileColor } from 'shared/types';
import { isJoker } from 'shared/gameLogic';
import TileComponent from './Tile';

interface MeldsAreaProps {
  players: PlayerState[];
  jokerTile: { color: TileColor; number: number };
  onExtendMeld?: (meldId: string) => void;
}

export default function MeldsArea({ players, jokerTile, onExtendMeld }: MeldsAreaProps) {
  const playersWithMelds = players.filter((p) => p.melds.length > 0);

  if (playersWithMelds.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        opacity: 0.4,
        fontSize: '0.9rem',
        fontStyle: 'italic',
      }}>
        No melds yet
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      overflowY: 'auto',
      flex: 1,
      padding: '4px',
    }}>
      {playersWithMelds.map((player) => (
        <div key={player.id}>
          <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '6px', fontWeight: 600 }}>
            {player.name}
            {player.meldMethod && (
              <span style={{
                marginLeft: '6px',
                fontSize: '0.65rem',
                background: 'rgba(255,255,255,0.15)',
                padding: '1px 6px',
                borderRadius: '4px',
              }}>
                {player.meldMethod === 'pairs' ? 'Pairs' : 'Sets/Runs'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {player.melds.map((meld) => (
              <div
                key={meld.id}
                onClick={() => onExtendMeld?.(meld.id)}
                style={{
                  display: 'flex',
                  gap: '3px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  padding: '6px',
                  border: onExtendMeld ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                  cursor: onExtendMeld ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
              >
                {meld.tiles.map((tile) => (
                  <TileComponent
                    key={tile.id}
                    tile={tile}
                    isJoker={isJoker(tile, jokerTile)}
                    small
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
