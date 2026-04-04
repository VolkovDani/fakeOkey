import { type Tile as TileType, type TileColor } from 'shared/types';
import { isJoker } from 'shared/gameLogic';
import TileComponent from './Tile';

interface PlayerHandProps {
  tiles: TileType[];
  jokerTile: { color: TileColor; number: number };
  selectedTileIds: Set<number>;
  onTileClick: (tileId: number) => void;
  isMyTurn: boolean;
  turnState: string;
  onMeld: () => void;
  onDiscard: () => void;
}

const TURN_STATE_LABELS: Record<string, string> = {
  must_draw: 'Draw a tile',
  can_meld: 'Meld or discard',
  must_discard: 'Discard a tile',
};

export default function PlayerHand({
  tiles,
  jokerTile,
  selectedTileIds,
  onTileClick,
  isMyTurn,
  turnState,
  onMeld,
  onDiscard,
}: PlayerHandProps) {
  const selectedCount = selectedTileIds.size;
  const canMeld = selectedCount >= 2;
  const canDiscard = selectedCount === 1;

  const btnBase: React.CSSProperties = {
    padding: '10px 22px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s, background 0.2s',
  };

  const turnStateLabel = TURN_STATE_LABELS[turnState] ?? turnState;

  return (
    <div style={{
      background: 'rgba(0,0,0,0.35)',
      borderTop: '2px solid rgba(255,255,255,0.1)',
      padding: '12px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontSize: '0.85rem',
          padding: '4px 12px',
          borderRadius: '20px',
          background: isMyTurn ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.1)',
          border: isMyTurn ? '1px solid #4caf50' : '1px solid rgba(255,255,255,0.2)',
          color: isMyTurn ? '#a5d6a7' : 'rgba(255,255,255,0.6)',
        }}>
          {isMyTurn ? turnStateLabel : 'Waiting for your turn'}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={{
              ...btnBase,
              background: canMeld && isMyTurn ? '#2e7d32' : 'rgba(255,255,255,0.1)',
              color: canMeld && isMyTurn ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: canMeld && isMyTurn ? 'pointer' : 'not-allowed',
            }}
            disabled={!canMeld || !isMyTurn}
            onClick={onMeld}
          >
            Meld ({selectedCount})
          </button>
          <button
            style={{
              ...btnBase,
              background: canDiscard && isMyTurn ? '#c62828' : 'rgba(255,255,255,0.1)',
              color: canDiscard && isMyTurn ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: canDiscard && isMyTurn ? 'pointer' : 'not-allowed',
            }}
            disabled={!canDiscard || !isMyTurn}
            onClick={onDiscard}
          >
            Discard
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        alignItems: 'flex-end',
        minHeight: '80px',
        paddingBottom: '10px',
      }}>
        {tiles.map((tile) => (
          <TileComponent
            key={tile.id}
            tile={tile}
            selected={selectedTileIds.has(tile.id)}
            isJoker={isJoker(tile, jokerTile)}
            onClick={() => onTileClick(tile.id)}
          />
        ))}
      </div>
    </div>
  );
}
