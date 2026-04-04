export type TileColor = "red" | "black" | "blue" | "yellow";

export interface Tile {
  id: number;
  color: TileColor;
  number: number; // 1-13, 0 for false joker
  isFalseJoker: boolean;
}

export interface Meld {
  id: string;
  tiles: Tile[];
  type: "set" | "run" | "pair";
  ownerId: string;
}

export interface PlayerState {
  id: string;
  name: string;
  tileCount: number;
  melds: Meld[];
  score: number;
  isOpened: boolean;
  meldMethod: "sets_runs" | "pairs" | null;
  disconnected: boolean;
}

export interface GameState {
  phase: "lobby" | "playing" | "round_end" | "game_over";
  myHand: Tile[];
  players: PlayerState[];
  currentPlayerId: string;
  discardPile: Tile[];
  drawPileCount: number;
  indicatorTile: Tile;
  jokerTile: { color: TileColor; number: number };
  myId: string;
  turnState: "must_draw" | "can_meld" | "must_discard";
}

export type ClientMessage =
  | { type: "join"; name: string; roomId: string }
  | { type: "create_room"; name: string; maxPlayers: 2 | 3 | 4 }
  | { type: "draw_tile"; source: "pile" | "discard" }
  | { type: "meld"; tileIds: number[] }
  | { type: "extend_meld"; meldId: string; tileId: number }
  | { type: "discard"; tileId: number };

export type ServerMessage =
  | { type: "game_state"; state: GameState }
  | { type: "error"; message: string }
  | { type: "room_created"; roomId: string }
  | { type: "player_joined"; name: string; players: string[] }
  | { type: "round_end"; scores: Record<string, number>; totalScores: Record<string, number> }
  | { type: "game_over"; finalScores: Record<string, number> }
  | { type: "player_left"; playerId: string; playerName: string; remainingSeconds: number };

export interface RoundContext {
  winnerId: string;
  winnerMethod: "sets_runs" | "pairs";
  discardedJoker: boolean;
  allAtOnce: boolean;
  players: Array<{
    id: string;
    hand: Tile[];
    isOpened: boolean;
    meldMethod: "sets_runs" | "pairs" | null;
  }>;
  jokerInfo: { color: TileColor; number: number };
}
