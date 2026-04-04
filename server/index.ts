import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";

import type {
  Tile,
  TileColor,
  Meld,
  PlayerState,
  GameState,
  ClientMessage,
  ServerMessage,
} from "shared/types";

import {
  createTileSet,
  shuffleTiles,
  getJokerInfo,
  isJoker,
  validateMeld,
  checkOpeningRequirement,
  calculateHandValue,
} from "shared/gameLogic";

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------

interface ServerPlayer {
  id: string;
  name: string;
  ws: WebSocket;
  hand: Tile[];
  melds: Meld[];
  score: number;
  isOpened: boolean;
  meldMethod: "sets_runs" | "pairs" | null;
}

interface Room {
  id: string;
  players: Map<string, ServerPlayer>;
  drawPile: Tile[];
  discardPile: Tile[];
  indicatorTile: Tile | null;
  jokerInfo: { color: TileColor; number: number } | null;
  currentPlayerIndex: number;
  phase: "lobby" | "playing" | "round_end";
  maxPlayers: number;
  turnState: "must_draw" | "can_meld" | "must_discard";
  playerOrder: string[];
}

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

const rooms = new Map<string, Room>();
const playerRooms = new Map<WebSocket, { roomId: string; playerId: string }>();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const generateRoomId = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
};

const generatePlayerId = (): string => randomUUID();

const send = (ws: WebSocket, msg: ServerMessage): void => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
};

const broadcast = (room: Room, msg: ServerMessage): void => {
  for (const player of room.players.values()) {
    send(player.ws, msg);
  }
};

const getPlayerNames = (room: Room): string[] => {
  return room.playerOrder.map((id) => room.players.get(id)!.name);
};

const buildPlayerState = (player: ServerPlayer): PlayerState => ({
  id: player.id,
  name: player.name,
  tileCount: player.hand.length,
  melds: player.melds,
  score: player.score,
  isOpened: player.isOpened,
  meldMethod: player.meldMethod,
});

const buildGameState = (room: Room, forPlayer: ServerPlayer): GameState => ({
  phase: room.phase === "round_end" ? "round_end" : room.phase === "lobby" ? "lobby" : "playing",
  myHand: forPlayer.hand,
  players: room.playerOrder.map((id) => buildPlayerState(room.players.get(id)!)),
  currentPlayerId: room.playerOrder[room.currentPlayerIndex] ?? "",
  discardPile: room.discardPile,
  drawPileCount: room.drawPile.length,
  indicatorTile: room.indicatorTile!,
  jokerTile: room.jokerInfo!,
  myId: forPlayer.id,
  turnState: room.turnState,
});

const broadcastGameState = (room: Room): void => {
  for (const player of room.players.values()) {
    const state = buildGameState(room, player);
    send(player.ws, { type: "game_state", state });
  }
};

let meldIdCounter = 0;
const nextMeldId = (): string => `meld_${++meldIdCounter}`;

// ---------------------------------------------------------------------------
// Room / round management
// ---------------------------------------------------------------------------

const startRound = (room: Room): void => {
  // Create and shuffle tiles
  const tiles = shuffleTiles(createTileSet());

  // Pick indicator tile (remove one from the set)
  const indicatorTile = tiles.pop()!;
  room.indicatorTile = indicatorTile;
  room.jokerInfo = getJokerInfo(indicatorTile);

  // Reset per-round player state
  for (const player of room.players.values()) {
    player.hand = [];
    player.melds = [];
    player.isOpened = false;
    player.meldMethod = null;
  }

  // Deal tiles: first player (index 0) gets 22, others get 21
  const playerCount = room.playerOrder.length;
  for (let i = 0; i < playerCount; i++) {
    const player = room.players.get(room.playerOrder[i])!;
    const count = i === 0 ? 22 : 21;
    player.hand = tiles.splice(0, count);
  }

  room.drawPile = tiles;
  room.discardPile = [];
  room.phase = "playing";
  room.currentPlayerIndex = 0;
  // First player already has 22 tiles (extra tile), so they skip the draw
  room.turnState = "can_meld";

  console.log(
    `[Room ${room.id}] Round started. Indicator: ${indicatorTile.color} ${indicatorTile.number}. ` +
      `Joker: ${room.jokerInfo.color} ${room.jokerInfo.number}. ` +
      `Draw pile: ${room.drawPile.length} tiles.`
  );

  broadcastGameState(room);
};

const advanceTurn = (room: Room): void => {
  room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.playerOrder.length;
  room.turnState = "must_draw";
};

// ---------------------------------------------------------------------------
// Message handlers
// ---------------------------------------------------------------------------

const handleCreateRoom = (ws: WebSocket, msg: Extract<ClientMessage, { type: "create_room" }>): void => {
  let roomId = generateRoomId();
  while (rooms.has(roomId)) {
    roomId = generateRoomId();
  }

  const playerId = generatePlayerId();
  const player: ServerPlayer = {
    id: playerId,
    name: msg.name,
    ws,
    hand: [],
    melds: [],
    score: 0,
    isOpened: false,
    meldMethod: null,
  };

  const room: Room = {
    id: roomId,
    players: new Map([[playerId, player]]),
    drawPile: [],
    discardPile: [],
    indicatorTile: null,
    jokerInfo: null,
    currentPlayerIndex: 0,
    phase: "lobby",
    maxPlayers: msg.maxPlayers,
    turnState: "must_draw",
    playerOrder: [playerId],
  };

  rooms.set(roomId, room);
  playerRooms.set(ws, { roomId, playerId });

  console.log(`[Room ${roomId}] Created by "${msg.name}" (${playerId}). Max players: ${msg.maxPlayers}`);

  send(ws, { type: "room_created", roomId });
  send(ws, { type: "player_joined", name: msg.name, players: [msg.name] });
};

const handleJoin = (ws: WebSocket, msg: Extract<ClientMessage, { type: "join" }>): void => {
  const room = rooms.get(msg.roomId);
  if (!room) {
    send(ws, { type: "error", message: "Room not found." });
    return;
  }
  if (room.phase !== "lobby") {
    send(ws, { type: "error", message: "Game already in progress." });
    return;
  }
  if (room.players.size >= room.maxPlayers) {
    send(ws, { type: "error", message: "Room is full." });
    return;
  }

  const playerId = generatePlayerId();
  const player: ServerPlayer = {
    id: playerId,
    name: msg.name,
    ws,
    hand: [],
    melds: [],
    score: 0,
    isOpened: false,
    meldMethod: null,
  };

  room.players.set(playerId, player);
  room.playerOrder.push(playerId);
  playerRooms.set(ws, { roomId: room.id, playerId });

  const names = getPlayerNames(room);

  console.log(`[Room ${room.id}] "${msg.name}" joined (${playerId}). Players: ${names.join(", ")}`);

  broadcast(room, { type: "player_joined", name: msg.name, players: names });

  // Auto-start when room is full
  if (room.players.size === room.maxPlayers) {
    console.log(`[Room ${room.id}] Room is full. Starting round.`);
    startRound(room);
  }
};

const handleDrawTileFromSource = (
  room: Room,
  player: ServerPlayer,
  source: "pile" | "discard"
): void => {
  if (room.playerOrder[room.currentPlayerIndex] !== player.id) {
    send(player.ws, { type: "error", message: "It is not your turn." });
    return;
  }
  if (room.turnState !== "must_draw") {
    send(player.ws, { type: "error", message: "You have already drawn a tile this turn." });
    return;
  }

  if (source === "pile") {
    if (room.drawPile.length === 0) {
      send(player.ws, { type: "error", message: "Draw pile is empty." });
      return;
    }
    const tile = room.drawPile.pop()!;
    player.hand.push(tile);
    console.log(`[Room ${room.id}] ${player.name} drew from pile. (${room.drawPile.length} remain)`);
  } else {
    if (room.discardPile.length === 0) {
      send(player.ws, { type: "error", message: "Discard pile is empty." });
      return;
    }
    const tile = room.discardPile.pop()!;
    player.hand.push(tile);
    console.log(`[Room ${room.id}] ${player.name} drew from discard pile.`);
  }

  room.turnState = "can_meld";

  // If draw pile is empty after draw, we could trigger end-of-round.
  // For MVP, the game continues until someone wins or pile is exhausted on next draw.

  broadcastGameState(room);
};

const handleMeld = (
  room: Room,
  player: ServerPlayer,
  tileIds: number[]
): void => {
  if (room.playerOrder[room.currentPlayerIndex] !== player.id) {
    send(player.ws, { type: "error", message: "It is not your turn." });
    return;
  }
  if (room.turnState !== "can_meld" && room.turnState !== "must_discard") {
    send(player.ws, { type: "error", message: "You cannot meld right now." });
    return;
  }

  // Find the tiles in the player's hand
  const tiles: Tile[] = [];
  for (const tileId of tileIds) {
    const tile = player.hand.find((t) => t.id === tileId);
    if (!tile) {
      send(player.ws, { type: "error", message: `Tile ${tileId} not found in your hand.` });
      return;
    }
    tiles.push(tile);
  }

  // Validate the meld
  const validation = validateMeld(tiles, room.jokerInfo!);
  if (!validation.valid || !validation.type) {
    send(player.ws, { type: "error", message: "Invalid meld." });
    return;
  }

  const meldType = validation.type;

  // Check meld method consistency
  if (player.meldMethod !== null) {
    if (player.meldMethod === "pairs" && meldType !== "pair") {
      send(player.ws, { type: "error", message: "You have chosen pairs. You can only meld pairs." });
      return;
    }
    if (player.meldMethod === "sets_runs" && meldType === "pair") {
      send(player.ws, {
        type: "error",
        message: "You have chosen sets/runs. You cannot meld pairs.",
      });
      return;
    }
  } else {
    // First meld — determine method
    if (meldType === "pair") {
      player.meldMethod = "pairs";
    } else {
      player.meldMethod = "sets_runs";
    }
  }

  // Create the meld and remove tiles from hand
  const meld: Meld = {
    id: nextMeldId(),
    tiles,
    type: meldType === "pair" ? "pair" : meldType,
    ownerId: player.id,
  };

  player.melds.push(meld);
  player.hand = player.hand.filter((t) => !tileIds.includes(t.id));

  // Check opening requirement
  if (!player.isOpened) {
    const opened = checkOpeningRequirement(player.melds, player.meldMethod, room.jokerInfo!);
    if (opened) {
      player.isOpened = true;
      console.log(`[Room ${room.id}] ${player.name} has opened (${player.meldMethod}).`);
    }
  }

  console.log(
    `[Room ${room.id}] ${player.name} melded ${meldType}: [${tiles.map((t) => `${t.color} ${t.number}`).join(", ")}]`
  );

  broadcastGameState(room);
};

const handleExtendMeld = (
  room: Room,
  player: ServerPlayer,
  meldId: string,
  tileId: number
): void => {
  if (room.playerOrder[room.currentPlayerIndex] !== player.id) {
    send(player.ws, { type: "error", message: "It is not your turn." });
    return;
  }
  if (room.turnState !== "can_meld" && room.turnState !== "must_discard") {
    send(player.ws, { type: "error", message: "You cannot extend melds right now." });
    return;
  }

  // Player must be opened to extend melds
  if (!player.isOpened) {
    send(player.ws, { type: "error", message: "You must open before extending melds." });
    return;
  }

  // Find the meld (can be any player's meld)
  let targetMeld: Meld | undefined;
  for (const p of room.players.values()) {
    targetMeld = p.melds.find((m) => m.id === meldId);
    if (targetMeld) break;
  }

  if (!targetMeld) {
    send(player.ws, { type: "error", message: "Meld not found." });
    return;
  }

  // Pairs cannot be extended
  if (targetMeld.type === "pair") {
    send(player.ws, { type: "error", message: "Pairs cannot be extended." });
    return;
  }

  // Find tile in hand
  const tileIndex = player.hand.findIndex((t) => t.id === tileId);
  if (tileIndex === -1) {
    send(player.ws, { type: "error", message: "Tile not found in your hand." });
    return;
  }

  const tile = player.hand[tileIndex];
  const extendedTiles = [...targetMeld.tiles, tile];

  // Validate the resulting meld is still valid
  const validation = validateMeld(extendedTiles, room.jokerInfo!);
  if (!validation.valid) {
    send(player.ws, { type: "error", message: "Adding this tile would make the meld invalid." });
    return;
  }

  // Apply the extension
  targetMeld.tiles = extendedTiles;
  player.hand.splice(tileIndex, 1);

  console.log(
    `[Room ${room.id}] ${player.name} extended meld ${meldId} with ${tile.color} ${tile.number}.`
  );

  broadcastGameState(room);
};

const handleDiscard = (room: Room, player: ServerPlayer, tileId: number): void => {
  if (room.playerOrder[room.currentPlayerIndex] !== player.id) {
    send(player.ws, { type: "error", message: "It is not your turn." });
    return;
  }
  if (room.turnState === "must_draw") {
    send(player.ws, { type: "error", message: "You must draw a tile first." });
    return;
  }

  // Find tile in hand
  const tileIndex = player.hand.findIndex((t) => t.id === tileId);
  if (tileIndex === -1) {
    send(player.ws, { type: "error", message: "Tile not found in your hand." });
    return;
  }

  const tile = player.hand[tileIndex];

  // Check: if player has melds but hasn't met opening requirement, return melds to hand
  if (player.melds.length > 0 && !player.isOpened) {
    console.log(
      `[Room ${room.id}] ${player.name} did not meet opening requirement. Returning melds to hand.`
    );
    for (const meld of player.melds) {
      player.hand.push(...meld.tiles);
    }
    player.melds = [];
    player.meldMethod = null;
  }

  // Remove tile from hand and add to discard pile
  player.hand.splice(tileIndex, 1);
  room.discardPile.push(tile);

  // Check joker discard penalty
  if (isJoker(tile, room.jokerInfo!)) {
    player.score += 101;
    console.log(`[Room ${room.id}] ${player.name} discarded a joker! +101 penalty.`);
  }

  console.log(`[Room ${room.id}] ${player.name} discarded ${tile.color} ${tile.number}.`);

  // Check win condition: hand is empty
  if (player.hand.length === 0) {
    console.log(`[Room ${room.id}] ${player.name} wins the round!`);
    handleRoundEnd(room, player);
    return;
  }

  // Check if draw pile is exhausted (no one can draw next turn)
  if (room.drawPile.length === 0) {
    console.log(`[Room ${room.id}] Draw pile exhausted. Ending round.`);
    handleRoundEnd(room, null);
    return;
  }

  // Advance to next player
  advanceTurn(room);
  broadcastGameState(room);
};

const handleRoundEnd = (room: Room, winner: ServerPlayer | null): void => {
  room.phase = "round_end";

  // Calculate round scores
  const roundScores: Record<string, number> = {};
  for (const player of room.players.values()) {
    if (winner && player.id === winner.id) {
      // Winner scores 0 for the round (they went out)
      roundScores[player.id] = 0;
    } else {
      // Other players score the value of tiles remaining in hand
      roundScores[player.id] = calculateHandValue(player.hand, room.jokerInfo!);
    }
  }

  // Add round scores to total scores
  const totalScores: Record<string, number> = {};
  for (const player of room.players.values()) {
    player.score += roundScores[player.id];
    totalScores[player.id] = player.score;
  }

  console.log(`[Room ${room.id}] Round ended. Scores:`, roundScores);
  console.log(`[Room ${room.id}] Total scores:`, totalScores);

  // Check if game is over (someone has >= 200 points — a common ending threshold)
  const maxScore = Math.max(...Object.values(totalScores));
  const isGameOver = maxScore >= 200;

  if (isGameOver) {
    // Map player IDs to names for final display
    const finalScores: Record<string, number> = {};
    for (const player of room.players.values()) {
      finalScores[player.id] = player.score;
    }

    broadcast(room, { type: "game_over", finalScores });
    console.log(`[Room ${room.id}] Game over!`);

    // Clean up room
    for (const player of room.players.values()) {
      playerRooms.delete(player.ws);
    }
    rooms.delete(room.id);
  } else {
    broadcast(room, { type: "round_end", scores: roundScores, totalScores });

    // Start next round after a short delay
    setTimeout(() => {
      if (rooms.has(room.id)) {
        console.log(`[Room ${room.id}] Starting next round.`);
        startRound(room);
      }
    }, 5000);
  }
};

// ---------------------------------------------------------------------------
// Disconnect handling
// ---------------------------------------------------------------------------

const handleDisconnect = (ws: WebSocket): void => {
  const info = playerRooms.get(ws);
  if (!info) return;

  const { roomId, playerId } = info;
  const room = rooms.get(roomId);
  playerRooms.delete(ws);

  if (!room) return;

  const player = room.players.get(playerId);
  const playerName = player?.name ?? "Unknown";

  console.log(`[Room ${roomId}] ${playerName} disconnected.`);

  if (room.phase === "lobby") {
    // Remove player from room
    room.players.delete(playerId);
    room.playerOrder = room.playerOrder.filter((id) => id !== playerId);

    if (room.players.size === 0) {
      rooms.delete(roomId);
      console.log(`[Room ${roomId}] Room empty. Deleted.`);
    } else {
      const names = getPlayerNames(room);
      broadcast(room, { type: "player_joined", name: playerName, players: names });
    }
  } else {
    // Game in progress: remove player, end game if needed
    room.players.delete(playerId);
    room.playerOrder = room.playerOrder.filter((id) => id !== playerId);

    if (room.players.size < 2) {
      // Not enough players to continue
      console.log(`[Room ${roomId}] Not enough players. Ending game.`);
      const finalScores: Record<string, number> = {};
      for (const p of room.players.values()) {
        finalScores[p.id] = p.score;
      }
      broadcast(room, { type: "game_over", finalScores });

      for (const p of room.players.values()) {
        playerRooms.delete(p.ws);
      }
      rooms.delete(roomId);
    } else {
      // Adjust current player index if needed
      if (room.currentPlayerIndex >= room.playerOrder.length) {
        room.currentPlayerIndex = 0;
      }
      // If it was the disconnected player's turn, reset turn state
      room.turnState = "must_draw";
      broadcastGameState(room);
    }
  }
};

// ---------------------------------------------------------------------------
// Message dispatch
// ---------------------------------------------------------------------------

const handleMessage = (ws: WebSocket, data: string): void => {
  let msg: ClientMessage;
  try {
    msg = JSON.parse(data) as ClientMessage;
  } catch {
    send(ws, { type: "error", message: "Invalid JSON." });
    return;
  }

  try {
    switch (msg.type) {
      case "create_room": {
        handleCreateRoom(ws, msg);
        break;
      }
      case "join": {
        handleJoin(ws, msg);
        break;
      }
      case "draw_tile": {
        const info = playerRooms.get(ws);
        if (!info) {
          send(ws, { type: "error", message: "You are not in a room." });
          return;
        }
        const room = rooms.get(info.roomId);
        const player = room?.players.get(info.playerId);
        if (!room || !player) {
          send(ws, { type: "error", message: "Room or player not found." });
          return;
        }
        if (room.phase !== "playing") {
          send(ws, { type: "error", message: "Game is not in progress." });
          return;
        }
        handleDrawTileFromSource(room, player, msg.source);
        break;
      }
      case "meld": {
        const info = playerRooms.get(ws);
        if (!info) {
          send(ws, { type: "error", message: "You are not in a room." });
          return;
        }
        const room = rooms.get(info.roomId);
        const player = room?.players.get(info.playerId);
        if (!room || !player) {
          send(ws, { type: "error", message: "Room or player not found." });
          return;
        }
        if (room.phase !== "playing") {
          send(ws, { type: "error", message: "Game is not in progress." });
          return;
        }
        handleMeld(room, player, msg.tileIds);
        break;
      }
      case "extend_meld": {
        const info = playerRooms.get(ws);
        if (!info) {
          send(ws, { type: "error", message: "You are not in a room." });
          return;
        }
        const room = rooms.get(info.roomId);
        const player = room?.players.get(info.playerId);
        if (!room || !player) {
          send(ws, { type: "error", message: "Room or player not found." });
          return;
        }
        if (room.phase !== "playing") {
          send(ws, { type: "error", message: "Game is not in progress." });
          return;
        }
        handleExtendMeld(room, player, msg.meldId, msg.tileId);
        break;
      }
      case "discard": {
        const info = playerRooms.get(ws);
        if (!info) {
          send(ws, { type: "error", message: "You are not in a room." });
          return;
        }
        const room = rooms.get(info.roomId);
        const player = room?.players.get(info.playerId);
        if (!room || !player) {
          send(ws, { type: "error", message: "Room or player not found." });
          return;
        }
        if (room.phase !== "playing") {
          send(ws, { type: "error", message: "Game is not in progress." });
          return;
        }
        handleDiscard(room, player, msg.tileId);
        break;
      }
      default: {
        send(ws, { type: "error", message: "Unknown message type." });
      }
    }
  } catch (err) {
    console.error("Error handling message:", err);
    send(ws, { type: "error", message: "Internal server error." });
  }
};

// ---------------------------------------------------------------------------
// WebSocket server
// ---------------------------------------------------------------------------

const PORT = 3001;

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws: WebSocket) => {
  console.log("New connection established.");

  ws.on("message", (raw) => {
    const data = typeof raw === "string" ? raw : raw.toString();
    handleMessage(ws, data);
  });

  ws.on("close", () => {
    handleDisconnect(ws);
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

console.log(`Okey 101 WebSocket server listening on port ${PORT}`);
