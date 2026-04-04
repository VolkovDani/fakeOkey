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
} as const;

export default en;
