import { type PlayerState, type TileColor } from 'shared/types';
import { isJoker } from 'shared/gameLogic';
import TileComponent from './Tile';

interface OpponentPanelProps {
  player: PlayerState;
  isCurrentTurn: boolean;
  jokerTile: { color: TileColor; number: number };
  position: 'top' | 'left' | 'right';
}

const FAKE_TILE = { id: -1, color: 'black' as TileColor, number: 1, isFalseJoker: false };

export default function OpponentPanel({ player, isCurrentTurn, jokerTile, position }: OpponentPanelProps) {
  const isVertical = position === 'left' || position === 'right';

  const panelStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.35)',
    borderRadius: '12px',
    border: isCurrentTurn ? '2px solid #4caf50' : '2px solid rgba(255,255,255,0.1)',
    padding: '10px',
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: 'center',
    gap: '8px',
    minWidth: isVertical ? '80px' : 'auto',
    maxWidth: isVertical ? '100px' : '100%',
    transition: 'border-color 0.3s',
  };

  const displayTiles = Math.min(player.tileCount, 14);

  return (
    <div style={panelStyle}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
        <div style={{
          fontWeight: 600,
          fontSize: '0.85rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: isVertical ? '70px' : '100px',
        }}>
          {player.name}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
          {player.score} pts
        </div>
        {isCurrentTurn && (
          <div style={{
            fontSize: '0.65rem',
            background: '#4caf50',
            color: '#fff',
            borderRadius: '4px',
            padding: '1px 6px',
            marginTop: '2px',
          }}>
            TURN
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        flexWrap: 'wrap',
        gap: '3px',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {Array.from({ length: displayTiles }).map((_, i) => (
          <TileComponent
            key={i}
            tile={FAKE_TILE}
            faceDown
            small
          />
        ))}
        {player.tileCount > 14 && (
          <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>+{player.tileCount - 14}</div>
        )}
      </div>

      {player.melds.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
          {player.melds.map((meld) => (
            <div key={meld.id} style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
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
      )}
    </div>
  );
}
