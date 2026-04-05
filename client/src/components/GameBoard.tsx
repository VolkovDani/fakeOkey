import { useState, useEffect, useCallback } from 'react';
import { type GameState, type ClientMessage } from 'shared/types';
import PlayerHand from './PlayerHand';
import OpponentPanel from './OpponentPanel';
import MeldsArea from './MeldsArea';
import DrawArea from './DrawArea';

interface GameBoardProps {
  gameState: GameState;
  sendMessage: (msg: ClientMessage) => void;
}

export default function GameBoard({ gameState, sendMessage }: GameBoardProps) {
  const [selectedTileIds, setSelectedTileIds] = useState<Set<number>>(new Set());
  const [handOrder, setHandOrder] = useState<number[]>([]);

  const {
    myHand,
    players,
    currentPlayerId,
    discardPile,
    drawPileCount,
    indicatorTile,
    jokerTile,
    myId,
    turnState,
  } = gameState;

  // Sync handOrder with myHand: preserve existing order, append new tiles, remove gone tiles
  useEffect(() => {
    const handIds = new Set(myHand.map((t) => t.id));
    setHandOrder((prev) => {
      const kept = prev.filter((id) => handIds.has(id));
      const keptSet = new Set(kept);
      const added = myHand.filter((t) => !keptSet.has(t.id)).map((t) => t.id);
      return [...kept, ...added];
    });
  }, [myHand]);

  const orderedHand = handOrder
    .map((id) => myHand.find((t) => t.id === id))
    .filter((t): t is (typeof myHand)[number] => t != null);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setHandOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const isMyTurn = currentPlayerId === myId;
  const opponents = players.filter((p) => p.id !== myId);
  const lastDiscard = discardPile.length > 0 ? discardPile[discardPile.length - 1] : null;
  const canDraw = isMyTurn && turnState === 'must_draw';

  function handleTileClick(tileId: number) {
    setSelectedTileIds((prev) => {
      const next = new Set(prev);
      if (next.has(tileId)) {
        next.delete(tileId);
      } else {
        next.add(tileId);
      }
      return next;
    });
  }

  function handleMeld() {
    if (selectedTileIds.size < 2) return;
    sendMessage({ type: 'meld', tileIds: [...selectedTileIds] });
    setSelectedTileIds(new Set());
  }

  function handleDiscard() {
    if (selectedTileIds.size !== 1) return;
    const [tileId] = selectedTileIds;
    sendMessage({ type: 'discard', tileId });
    setSelectedTileIds(new Set());
  }

  function handleDrawFromPile() {
    sendMessage({ type: 'draw_tile', source: 'pile' });
  }

  function handleDrawFromDiscard() {
    sendMessage({ type: 'draw_tile', source: 'discard' });
  }

  function handleExtendMeld(meldId: string) {
    if (selectedTileIds.size !== 1) return;
    const [tileId] = selectedTileIds;
    sendMessage({ type: 'extend_meld', meldId, tileId });
    setSelectedTileIds(new Set());
  }

  // Build opponent position assignments
  type Position = 'top' | 'left' | 'right';
  function getOpponentPositions(): Position[] {
    if (opponents.length === 1) return ['top'];
    if (opponents.length === 2) return ['left', 'top'];
    return ['left', 'top', 'right'];
  }

  const positions = getOpponentPositions();

  const topOpponents = opponents.filter((_, i) => positions[i] === 'top');
  const leftOpponents = opponents.filter((_, i) => positions[i] === 'left');
  const rightOpponents = opponents.filter((_, i) => positions[i] === 'right');

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Top opponent row */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        padding: '12px',
        flexShrink: 0,
      }}>
        {topOpponents.map((opp) => (
          <OpponentPanel
            key={opp.id}
            player={opp}
            isCurrentTurn={opp.id === currentPlayerId}
            jokerTile={jokerTile}
            position="top"
          />
        ))}
      </div>

      {/* Middle row: left opponent + center + right opponent */}
      <div style={{
        display: 'flex',
        flex: 1,
        gap: '8px',
        padding: '0 8px',
        overflow: 'hidden',
      }}>
        {/* Left opponents */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', flexShrink: 0 }}>
          {leftOpponents.map((opp) => (
            <OpponentPanel
              key={opp.id}
              player={opp}
              isCurrentTurn={opp.id === currentPlayerId}
              jokerTile={jokerTile}
              position="left"
            />
          ))}
        </div>

        {/* Center area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            flex: 1,
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <MeldsArea
              players={players}
              jokerTile={jokerTile}
              onExtendMeld={isMyTurn && turnState !== 'must_draw' && selectedTileIds.size === 1
                ? handleExtendMeld
                : undefined}
            />
          </div>

          <DrawArea
            drawPileCount={drawPileCount}
            lastDiscard={lastDiscard}
            indicatorTile={indicatorTile}
            jokerTile={jokerTile}
            canDraw={canDraw}
            onDrawFromPile={handleDrawFromPile}
            onDrawFromDiscard={handleDrawFromDiscard}
          />
        </div>

        {/* Right opponents */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', flexShrink: 0 }}>
          {rightOpponents.map((opp) => (
            <OpponentPanel
              key={opp.id}
              player={opp}
              isCurrentTurn={opp.id === currentPlayerId}
              jokerTile={jokerTile}
              position="right"
            />
          ))}
        </div>
      </div>

      {/* Bottom: my hand */}
      <PlayerHand
        tiles={orderedHand}
        jokerTile={jokerTile}
        selectedTileIds={selectedTileIds}
        onTileClick={handleTileClick}
        isMyTurn={isMyTurn}
        turnState={turnState}
        onMeld={handleMeld}
        onDiscard={handleDiscard}
        onReorder={handleReorder}
      />

    </div>
  );
}
