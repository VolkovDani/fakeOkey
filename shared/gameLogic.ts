import { Tile, TileColor, Meld, RoundContext } from "./types";

export function createTileSet(): Tile[] {
  const tiles: Tile[] = [];
  const colors: TileColor[] = ["red", "black", "blue", "yellow"];
  let id = 0;

  for (const color of colors) {
    for (let num = 1; num <= 13; num++) {
      // 2 copies of each
      tiles.push({ id: id++, color, number: num, isFalseJoker: false });
      tiles.push({ id: id++, color, number: num, isFalseJoker: false });
    }
  }

  // 2 false jokers
  tiles.push({ id: id++, color: "red", number: 0, isFalseJoker: true });
  tiles.push({ id: id++, color: "red", number: 0, isFalseJoker: true });

  return tiles;
}

export function shuffleTiles(tiles: Tile[]): Tile[] {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function getJokerInfo(indicator: Tile): { color: TileColor; number: number } {
  const nextNumber = indicator.number === 13 ? 1 : indicator.number + 1;
  return { color: indicator.color, number: nextNumber };
}

export function isJoker(tile: Tile, jokerInfo: { color: TileColor; number: number }): boolean {
  if (tile.isFalseJoker) return true;
  return tile.color === jokerInfo.color && tile.number === jokerInfo.number;
}

export function validateSet(tiles: Tile[], jokerInfo: { color: TileColor; number: number }): boolean {
  if (tiles.length < 3 || tiles.length > 4) return false;

  const nonJokers = tiles.filter((t) => !isJoker(t, jokerInfo));
  const jokerCount = tiles.length - nonJokers.length;

  if (nonJokers.length === 0) return false;

  // All non-jokers must have the same number
  const number = nonJokers[0].number;
  if (!nonJokers.every((t) => t.number === number)) return false;

  // All non-jokers must have different colors
  const colors = new Set(nonJokers.map((t) => t.color));
  if (colors.size !== nonJokers.length) return false;

  // Total (non-jokers + jokers) must not exceed 4 unique colors
  if (nonJokers.length + jokerCount > 4) return false;

  return true;
}

export function validateRun(tiles: Tile[], jokerInfo: { color: TileColor; number: number }): boolean {
  if (tiles.length < 3) return false;

  const nonJokers = tiles.filter((t) => !isJoker(t, jokerInfo));
  const jokerCount = tiles.length - nonJokers.length;

  if (nonJokers.length === 0) return false;

  // All non-jokers must have the same color
  const color = nonJokers[0].color;
  if (!nonJokers.every((t) => t.color === color)) return false;

  // Sort non-jokers by number
  const sorted = [...nonJokers].sort((a, b) => a.number - b.number);

  // Check for duplicate numbers among non-jokers
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].number === sorted[i - 1].number) return false;
  }

  // Try to fill gaps with jokers
  let jokersLeft = jokerCount;
  let sequence: number[] = [sorted[0].number];

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].number - sorted[i - 1].number - 1;
    if (gap < 0) return false;
    if (gap > jokersLeft) return false;
    jokersLeft -= gap;
    for (let g = 1; g <= gap; g++) {
      sequence.push(sorted[i - 1].number + g);
    }
    sequence.push(sorted[i].number);
  }

  // Remaining jokers extend at the beginning or end
  // Try extending at the beginning first
  while (jokersLeft > 0) {
    const first = sequence[0];
    const last = sequence[sequence.length - 1];
    if (first > 1) {
      sequence.unshift(first - 1);
      jokersLeft--;
    } else if (last < 13) {
      sequence.push(last + 1);
      jokersLeft--;
    } else {
      return false; // can't place remaining jokers
    }
  }

  // 1 can only be at the bottom (below 2)
  // Verify sequence doesn't wrap around
  if (sequence[sequence.length - 1] > 13) return false;
  if (sequence[0] < 1) return false;

  return true;
}

export function validatePair(tiles: Tile[]): boolean {
  if (tiles.length !== 2) return false;
  // No jokers in pairs
  if (tiles[0].isFalseJoker || tiles[1].isFalseJoker) return false;
  return tiles[0].number === tiles[1].number && tiles[0].color === tiles[1].color;
}

export function validateMeld(
  tiles: Tile[],
  jokerInfo: { color: TileColor; number: number }
): { valid: boolean; type: "set" | "run" | "pair" | null } {
  if (validatePair(tiles)) return { valid: true, type: "pair" };
  if (validateSet(tiles, jokerInfo)) return { valid: true, type: "set" };
  if (validateRun(tiles, jokerInfo)) return { valid: true, type: "run" };
  return { valid: false, type: null };
}

export function calculateTileValue(tile: Tile, jokerInfo: { color: TileColor; number: number }): number {
  if (isJoker(tile, jokerInfo)) return jokerInfo.number;
  return tile.number;
}

export function calculateMeldValue(tiles: Tile[], jokerInfo: { color: TileColor; number: number }): number {
  return tiles.reduce((sum, t) => sum + calculateTileValue(t, jokerInfo), 0);
}

export function checkOpeningRequirement(
  melds: Meld[],
  method: "sets_runs" | "pairs",
  jokerInfo: { color: TileColor; number: number }
): boolean {
  if (method === "sets_runs") {
    const totalValue = melds.reduce((sum, m) => sum + calculateMeldValue(m.tiles, jokerInfo), 0);
    return totalValue >= 101;
  } else {
    const pairCount = melds.filter((m) => m.type === "pair").length;
    return pairCount >= 5;
  }
}

export function calculateHandValue(hand: Tile[], jokerInfo: { color: TileColor; number: number }): number {
  return hand.reduce((sum, t) => {
    if (isJoker(t, jokerInfo)) return sum + jokerInfo.number;
    return sum + t.number;
  }, 0);
}

export function countJokersInHand(hand: Tile[], jokerInfo: { color: TileColor; number: number }): number {
  return hand.filter((t) => isJoker(t, jokerInfo)).length;
}

export function calculateRoundScores(ctx: RoundContext): Record<string, number> {
  const scores: Record<string, number> = {};

  // All-at-once special case
  if (ctx.allAtOnce) {
    if (ctx.discardedJoker) {
      scores[ctx.winnerId] = -404;
      for (const p of ctx.players) {
        if (p.id !== ctx.winnerId) scores[p.id] = 808;
      }
    } else {
      scores[ctx.winnerId] = -202;
      for (const p of ctx.players) {
        if (p.id !== ctx.winnerId) scores[p.id] = 404;
      }
    }
    return scores;
  }

  // Determine multipliers based on winner method and joker discard
  let winnerScore: number;
  let setsRunsMultiplier: number;
  let pairsMultiplier: number;
  let unopenedPenalty: number;

  if (ctx.winnerMethod === "sets_runs" && !ctx.discardedJoker) {
    winnerScore = -101;
    setsRunsMultiplier = 1;
    pairsMultiplier = 2;
    unopenedPenalty = 202;
  } else if (ctx.winnerMethod === "sets_runs" && ctx.discardedJoker) {
    winnerScore = -202;
    setsRunsMultiplier = 2;
    pairsMultiplier = 4;
    unopenedPenalty = 404;
  } else if (ctx.winnerMethod === "pairs" && !ctx.discardedJoker) {
    winnerScore = -202;
    setsRunsMultiplier = 2;
    pairsMultiplier = 4;
    unopenedPenalty = 404;
  } else {
    // pairs + joker discard
    winnerScore = -404;
    setsRunsMultiplier = 4;
    pairsMultiplier = 8;
    unopenedPenalty = 404;
  }

  scores[ctx.winnerId] = winnerScore;

  for (const p of ctx.players) {
    if (p.id === ctx.winnerId) continue;

    if (!p.isOpened) {
      scores[p.id] = unopenedPenalty;
    } else {
      const handValue = calculateHandValue(p.hand, ctx.jokerInfo);
      const multiplier = p.meldMethod === "pairs" ? pairsMultiplier : setsRunsMultiplier;
      scores[p.id] = handValue * multiplier;
    }

    // Joker penalty: 101 per unplayed joker in hand
    const jokerCount = countJokersInHand(p.hand, ctx.jokerInfo);
    scores[p.id] += jokerCount * 101;
  }

  return scores;
}
