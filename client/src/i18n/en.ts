const en = {
  connecting: 'Connecting...',
  connectionError: 'Connection error. Retrying...',

  // Lobby
  gameTitle: 'Okey 101',
  roomCode: 'Room Code',
  playersCount: 'Players ({count}):',
  waitingForPlayers: 'Waiting for players...',
  yourName: 'Your Name',
  enterYourName: 'Enter your name',
  createRoom: 'Create Room',
  numberOfPlayers: 'Number of Players',
  nPlayers: '{count} Players',
  or: 'or',
  joinRoom: 'Join Room',

  // Game - PlayerHand
  drawATile: 'Draw a tile',
  meldOrDiscard: 'Meld or discard',
  discardATile: 'Discard a tile',
  waitingForYourTurn: 'Waiting for your turn',
  meldCount: 'Meld ({count})',
  discard: 'Discard',

  // Game - MeldsArea
  noMeldsYet: 'No melds yet',
  pairs: 'Pairs',
  setsRuns: 'Sets/Runs',

  // Game - DrawArea
  drawPileCount: 'Draw Pile ({count})',
  empty: 'Empty',

  // Game - OpponentPanel
  pts: 'pts',
  turn: 'TURN',
  disconnected: 'disconnected',
  playerDisconnected: '{name} disconnected',
  roomClosesIn: 'Room closes in',

  // Game - IndicatorDisplay
  indicator: 'Indicator',
  joker: 'Joker:',

  // ScoreBoard
  gameOver: 'Game Over!',
  roundEnd: 'Round End',
  winner: 'Winner: {name}',
  player: 'Player',
  round: 'Round',
  total: 'Total',
  win: 'WIN',
  nextRound: 'Next Round',

  // Error messages
  error_roomNotFound: 'Room not found.',
  error_gameInProgress: 'Game already in progress.',
  error_roomFull: 'Room is full.',
  error_notYourTurn: 'It is not your turn.',
  error_alreadyDrawn: 'You have already drawn a tile this turn.',
  error_drawPileEmpty: 'Draw pile is empty.',
  error_discardPileEmpty: 'Discard pile is empty.',
  error_tileNotInHand: 'Tile {tileId} not found in your hand.',
  error_invalidMeld: 'Invalid meld.',
  error_onlyPairs: 'You have chosen pairs. You can only meld pairs.',
  error_noPairs: 'You have chosen sets/runs. You cannot meld pairs.',
  error_cannotExtendNow: 'You cannot extend melds right now.',
  error_mustOpenFirst: 'You must open before extending melds.',
  error_meldNotFound: 'Meld not found.',
  error_pairsNoExtend: 'Pairs cannot be extended.',
  error_extendInvalid: 'Adding this tile would make the meld invalid.',
  error_mustDrawFirst: 'You must draw a tile first.',
  error_invalidJson: 'Invalid JSON.',
  error_notInRoom: 'You are not in a room.',
  error_roomOrPlayerNotFound: 'Room or player not found.',
  error_gameNotInProgress: 'Game is not in progress.',
  error_unknownMessage: 'Unknown message type.',
  error_internalError: 'Internal server error.',
} as const;

export default en;
