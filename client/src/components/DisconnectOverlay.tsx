import { useState, useEffect } from 'react';
import { type DisconnectInfo } from '../hooks/useWebSocket';
import { useI18n } from '../i18n';

interface DisconnectOverlayProps {
  info: DisconnectInfo;
}

export default function DisconnectOverlay({ info }: DisconnectOverlayProps) {
  const { t } = useI18n();
  const [seconds, setSeconds] = useState(info.remainingSeconds);

  useEffect(() => {
    setSeconds(info.remainingSeconds);
  }, [info.remainingSeconds]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'rgba(30, 30, 30, 0.95)',
        borderRadius: '16px',
        padding: '32px 48px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        border: '1px solid rgba(255,255,255,0.15)',
      }}>
        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ff5252' }}>
          {t('playerDisconnected', { name: info.playerName })}
        </div>
        <div style={{ fontSize: '0.95rem', opacity: 0.7 }}>
          {t('roomClosesIn')}
        </div>
        <div style={{
          fontSize: '3rem',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: seconds <= 30 ? '#ff5252' : '#fff',
        }}>
          {display}
        </div>
      </div>
    </div>
  );
}
