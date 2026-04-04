import { type Tile as TileType, type TileColor } from 'shared/types';
import { isJoker } from 'shared/gameLogic';
import TileComponent from './Tile';

interface DrawAreaProps {
  drawPileCount: number;
  lastDiscard: TileType | null;
  jokerTile: { color: TileColor; number: number };
  canDraw: boolean;
  onDrawFromPile: () => void;
  onDrawFromDiscard: () => void;
}

const FAKE_TILE = { id: -2, color: 'black' as TileColor, number: 1, isFalseJoker: false };

export default function DrawArea({
  drawPileCount,
  lastDiscard,
  jokerTile,
  canDraw,
  onDrawFromPile,
  onDrawFromDiscard,
}: DrawAreaProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '24px',
      padding: '16px',
    }}>
      <div
        onClick={canDraw ? onDrawFromPile : undefined}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: canDraw ? 'pointer' : 'not-allowed',
          opacity: canDraw ? 1 : 0.5,
        }}
      >
        <div style={{ position: 'relative' }}>
          <TileComponent tile={FAKE_TILE} faceDown />
          {drawPileCount > 1 && (
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              width: '50px',
              height: '70px',
              background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
              borderRadius: '8px',
              zIndex: -1,
              border: '1px solid rgba(255,255,255,0.1)',
            }} />
          )}
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          Draw Pile ({drawPileCount})
        </div>
      </div>

      <div style={{ opacity: 0.4, fontSize: '1.5rem' }}>|</div>

      <div
        onClick={canDraw && lastDiscard ? onDrawFromDiscard : undefined}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: canDraw && lastDiscard ? 'pointer' : 'not-allowed',
          opacity: canDraw && lastDiscard ? 1 : 0.5,
        }}
      >
        {lastDiscard ? (
          <TileComponent
            tile={lastDiscard}
            isJoker={isJoker(lastDiscard, jokerTile)}
          />
        ) : (
          <div style={{
            width: '50px',
            height: '70px',
            borderRadius: '8px',
            border: '2px dashed rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            opacity: 0.4,
          }}>
            Empty
          </div>
        )}
        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
          Discard
        </div>
      </div>
    </div>
  );
}
