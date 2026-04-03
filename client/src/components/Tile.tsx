import { type Tile as TileType } from '../../../shared/types';

const COLOR_MAP: Record<string, string> = {
  red: '#d32f2f',
  black: '#212121',
  blue: '#1565c0',
  yellow: '#f9a825',
};

interface TileProps {
  tile: TileType;
  selected?: boolean;
  isJoker?: boolean;
  faceDown?: boolean;
  onClick?: () => void;
  small?: boolean;
}

export default function Tile({ tile, selected, isJoker, faceDown, onClick, small }: TileProps) {
  const width = small ? 35 : 50;
  const height = small ? 50 : 70;

  const baseStyle: React.CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    borderRadius: small ? '5px' : '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : 'default',
    userSelect: 'none',
    flexShrink: 0,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    position: 'relative',
    fontWeight: 700,
    fontSize: small ? '0.75rem' : '1.1rem',
  };

  if (faceDown) {
    return (
      <div
        style={{
          ...baseStyle,
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
        onClick={onClick}
      />
    );
  }

  const tileColor = COLOR_MAP[tile.color] ?? '#212121';

  const tileStyle: React.CSSProperties = {
    ...baseStyle,
    background: '#fff',
    color: tileColor,
    boxShadow: selected
      ? `0 0 0 3px #1976d2, 0 4px 12px rgba(0,0,0,0.4)`
      : isJoker
        ? `0 0 0 2px #f9a825, 0 2px 8px rgba(249,168,37,0.6)`
        : '0 2px 6px rgba(0,0,0,0.35)',
    transform: selected ? 'translateY(-10px)' : 'translateY(0)',
    border: isJoker && !selected ? '2px solid #f9a825' : '2px solid transparent',
  };

  const displayText = tile.isFalseJoker ? 'J' : String(tile.number);

  return (
    <div style={tileStyle} onClick={onClick}>
      {displayText}
      {isJoker && !tile.isFalseJoker && (
        <span style={{
          position: 'absolute',
          top: '2px',
          right: '3px',
          fontSize: '0.5rem',
          color: '#f9a825',
          fontWeight: 900,
          lineHeight: 1,
        }}>
          ★
        </span>
      )}
    </div>
  );
}
