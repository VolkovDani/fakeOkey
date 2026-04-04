import { type Tile as TileType, type TileColor } from 'shared/types';
import TileComponent from './Tile';

interface IndicatorDisplayProps {
  indicatorTile: TileType;
  jokerTile: { color: TileColor; number: number };
}

export default function IndicatorDisplay({ indicatorTile, jokerTile }: IndicatorDisplayProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '10px',
      padding: '10px 12px',
      minWidth: '80px',
    }}>
      <div style={{ fontSize: '0.65rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Indicator
      </div>
      <TileComponent tile={indicatorTile} small />
      <div style={{ fontSize: '0.65rem', opacity: 0.8, textAlign: 'center' }}>
        <div style={{ opacity: 0.6 }}>Joker:</div>
        <div style={{ fontWeight: 700, color: jokerTileColor(jokerTile.color) }}>
          {jokerTile.color} {jokerTile.number}
        </div>
      </div>
    </div>
  );
}

function jokerTileColor(color: TileColor): string {
  const map: Record<TileColor, string> = {
    red: '#ef9a9a',
    black: '#e0e0e0',
    blue: '#90caf9',
    yellow: '#fff176',
  };
  return map[color];
}
