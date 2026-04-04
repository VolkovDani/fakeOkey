import { type Translations } from './types';

const ru: Translations = {
  connecting: 'Подключение...',
  connectionError: 'Ошибка соединения. Повторная попытка...',

  gameTitle: 'Okey 101',
  roomCode: 'Код комнаты',
  playersCount: 'Игроки ({count}):',
  waitingForPlayers: 'Ожидание игроков...',
  yourName: 'Ваше имя',
  enterYourName: 'Введите имя',
  createRoom: 'Создать комнату',
  numberOfPlayers: 'Количество игроков',
  nPlayers: '{count} игрока',
  or: 'или',
  joinRoom: 'Войти в комнату',

  drawATile: 'Возьмите фишку',
  meldOrDiscard: 'Выложите или сбросьте',
  discardATile: 'Сбросьте фишку',
  waitingForYourTurn: 'Ожидание хода',
  meldCount: 'Выложить ({count})',
  discard: 'Сбросить',

  noMeldsYet: 'Нет комбинаций',
  pairs: 'Пары',
  setsRuns: 'Группы/Ряды',

  drawPileCount: 'Колода ({count})',
  empty: 'Пусто',

  pts: 'очк.',
  turn: 'ХОД',
  disconnected: 'отключён',
  playerDisconnected: '{name} отключился',
  roomClosesIn: 'Комната закроется через',

  indicator: 'Индикатор',
  joker: 'Джокер:',

  gameOver: 'Игра окончена!',
  roundEnd: 'Конец раунда',
  winner: 'Победитель: {name}',
  player: 'Игрок',
  round: 'Раунд',
  total: 'Итого',
  win: 'ПОБЕДА',
  nextRound: 'Следующий раунд',
};

export default ru;
