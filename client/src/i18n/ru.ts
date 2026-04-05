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

  // Ошибки
  error_roomNotFound: 'Комната не найдена.',
  error_gameInProgress: 'Игра уже идёт.',
  error_roomFull: 'Комната заполнена.',
  error_notYourTurn: 'Сейчас не ваш ход.',
  error_alreadyDrawn: 'Вы уже взяли фишку в этом ходу.',
  error_drawPileEmpty: 'Колода пуста.',
  error_discardPileEmpty: 'Сброс пуст.',
  error_tileNotInHand: 'Фишка {tileId} не найдена в вашей руке.',
  error_invalidMeld: 'Недопустимая комбинация.',
  error_onlyPairs: 'Вы выбрали пары. Можно выкладывать только пары.',
  error_noPairs: 'Вы выбрали группы/ряды. Нельзя выкладывать пары.',
  error_cannotExtendNow: 'Сейчас нельзя дополнять комбинации.',
  error_mustOpenFirst: 'Сначала нужно открыться.',
  error_meldNotFound: 'Комбинация не найдена.',
  error_pairsNoExtend: 'Пары нельзя дополнять.',
  error_extendInvalid: 'Добавление этой фишки сделает комбинацию недопустимой.',
  error_mustDrawFirst: 'Сначала возьмите фишку.',
  error_invalidJson: 'Неверный JSON.',
  error_notInRoom: 'Вы не в комнате.',
  error_roomOrPlayerNotFound: 'Комната или игрок не найдены.',
  error_gameNotInProgress: 'Игра не идёт.',
  error_unknownMessage: 'Неизвестный тип сообщения.',
  error_internalError: 'Внутренняя ошибка сервера.',
};

export default ru;
