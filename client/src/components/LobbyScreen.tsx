import { useState } from 'react';
import { type ClientMessage } from '../../../shared/types';

interface LobbyScreenProps {
  roomId: string | null;
  players: string[];
  sendMessage: (msg: ClientMessage) => void;
}

export default function LobbyScreen({ roomId, players, sendMessage }: LobbyScreenProps) {
  const [name, setName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 3 | 4>(4);
  const [joinCode, setJoinCode] = useState('');

  function handleCreate() {
    if (!name.trim()) return;
    sendMessage({ type: 'create_room', name: name.trim(), maxPlayers });
  }

  function handleJoin() {
    if (!name.trim() || !joinCode.trim()) return;
    sendMessage({ type: 'join', name: name.trim(), roomId: joinCode.trim().toUpperCase() });
  }

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    borderRadius: '16px',
    padding: '32px',
    width: '100%',
    maxWidth: '420px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
  };

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const btnStyle: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#2e7d32',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    opacity: 0.8,
    marginBottom: '4px',
    display: 'block',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  if (roomId) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={cardStyle}>
          <h1 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem', fontWeight: 700 }}>
            Okey 101
          </h1>
          <div style={{ ...sectionStyle, alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '1.1rem', opacity: 0.8 }}>Room Code</div>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              letterSpacing: '8px',
              background: 'rgba(255,255,255,0.1)',
              padding: '12px 24px',
              borderRadius: '12px',
            }}>
              {roomId}
            </div>
            <div style={{ width: '100%' }}>
              <div style={{ marginBottom: '8px', opacity: 0.7 }}>Players ({players.length}):</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {players.map((p) => (
                  <li key={p} style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '8px' }}>
              Waiting for players...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={cardStyle}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '2rem', fontWeight: 700 }}>
          Okey 101
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Your Name</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>Create Room</div>
            <div>
              <label style={labelStyle}>Number of Players</label>
              <select
                style={selectStyle}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value) as 2 | 3 | 4)}
              >
                <option value={2}>2 Players</option>
                <option value={3}>3 Players</option>
                <option value={4}>4 Players</option>
              </select>
            </div>
            <button style={btnStyle} onClick={handleCreate}>
              Create Room
            </button>
          </div>

          <div style={{ textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>or</div>

          <div style={sectionStyle}>
            <div style={{ fontWeight: 600, fontSize: '1rem' }}>Join Room</div>
            <div>
              <label style={labelStyle}>Room Code</label>
              <input
                style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: '4px', textAlign: 'center' }}
                type="text"
                placeholder="XXXX"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={8}
              />
            </div>
            <button style={{ ...btnStyle, background: '#1565c0' }} onClick={handleJoin}>
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
