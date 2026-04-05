import { useState, useEffect, useRef, useCallback } from 'react';
import { type GameState, type ClientMessage, type ServerMessage } from 'shared/types';

export interface DisconnectInfo {
  playerName: string;
  remainingSeconds: number;
}

interface UseWebSocketReturn {
  gameState: GameState | null;
  connected: boolean;
  roomId: string | null;
  players: string[];
  error: string | null;
  roundScores: Record<string, number> | null;
  totalScores: Record<string, number> | null;
  disconnectInfo: DisconnectInfo | null;
  sendMessage: (msg: ClientMessage) => void;
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [roundScores, setRoundScores] = useState<Record<string, number> | null>(null);
  const [totalScores, setTotalScores] = useState<Record<string, number> | null>(null);
  const [disconnectInfo, setDisconnectInfo] = useState<DisconnectInfo | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const sendMessage = useCallback((msg: ClientMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  useEffect(() => {
    unmountedRef.current = false;

    function connect() {
      if (unmountedRef.current) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmountedRef.current) return;
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event: MessageEvent) => {
        if (unmountedRef.current) return;
        let msg: ServerMessage;
        try {
          msg = JSON.parse(event.data as string) as ServerMessage;
        } catch {
          return;
        }

        switch (msg.type) {
          case 'game_state':
            setGameState(msg.state);
            break;
          case 'error':
            setError(msg.code);
            break;
          case 'room_created':
            setRoomId(msg.roomId);
            break;
          case 'player_joined':
            setPlayers(msg.players);
            setDisconnectInfo(null);
            break;
          case 'round_end':
            setRoundScores(msg.scores);
            setTotalScores(msg.totalScores);
            setGameState((prev) => prev ? { ...prev, phase: 'round_end' } : prev);
            break;
          case 'game_over':
            setTotalScores(msg.finalScores);
            setGameState((prev) => prev ? { ...prev, phase: 'game_over' } : prev);
            setDisconnectInfo(null);
            break;
          case 'player_left':
            setDisconnectInfo({ playerName: msg.playerName, remainingSeconds: msg.remainingSeconds });
            break;
        }
      };

      ws.onclose = () => {
        if (unmountedRef.current) return;
        setConnected(false);
        wsRef.current = null;
        reconnectTimerRef.current = setTimeout(() => {
          if (!unmountedRef.current) connect();
        }, 3000);
      };

      ws.onerror = () => {
        if (unmountedRef.current) return;
        setError('connectionError');
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [url]);

  return { gameState, connected, roomId, players, error, roundScores, totalScores, disconnectInfo, sendMessage };
}
