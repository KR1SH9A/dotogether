import React from 'react';
import { AsciiLoader } from './AsciiLoader';

export const ServerWakeLoader: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    background: 'var(--bg-color)',
    color: 'var(--text-main)',
    textAlign: 'center',
    padding: '24px',
  }}>
    <AsciiLoader />
    <div>
      <h2 style={{ marginBottom: '8px' }}>Starting the server...</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', lineHeight: '1.6' }}>
        Sorry you had to face this — the backend is hosted on a free tier and may take up to a minute to wake up after inactivity :(
      </p>
    </div>
  </div>
);
