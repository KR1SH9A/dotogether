import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { setDownReporter, clearDownReporter } from '../api/serverStatusBridge';

export type BackendStatus = 'warming' | 'up' | 'down';

interface BackendStatusContextValue {
  status: BackendStatus;
  markDown: () => void;
  markUp: () => void;
  retryNow: () => Promise<void>;
}

const BackendStatusContext = createContext<BackendStatusContextValue | null>(null);

export const BackendStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<BackendStatus>('warming');

  const markDown = useCallback(() => {
    setStatus((s) => (s === 'down' ? s : 'down'));
  }, []);

  const markUp = useCallback(() => {
    setStatus('up');
  }, []);

  const retryNow = useCallback(async () => {
    try {
      await apiClient.get('/health', { timeout: 5_000 });
      setStatus('up');
    } catch {
      setStatus('down');
    }
  }, []);

  useEffect(() => {
    setDownReporter(markDown);
    return () => clearDownReporter();
  }, [markDown]);

  // Initial probe
  useEffect(() => {
    const ctrl = new AbortController();
    apiClient
      .get('/health', { signal: ctrl.signal, timeout: 30_000 })
      .then(() => setStatus('up'))
      .catch(() => setStatus('down'));
    return () => ctrl.abort();
  }, []);

  // Aggressive recovery while down
  useEffect(() => {
    if (status !== 'down') return;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      try {
        await apiClient.get('/health', { timeout: 4_000 });
        if (!cancelled) setStatus('up');
      } catch {
        // keep polling
      }
    };

    tick();
    const id = window.setInterval(tick, 2_000);
    const onOnline = () => tick();
    const onVisible = () => { if (!document.hidden) tick(); };
    window.addEventListener('online', onOnline);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.removeEventListener('online', onOnline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [status]);

  return (
    <BackendStatusContext.Provider value={{ status, markDown, markUp, retryNow }}>
      {children}
    </BackendStatusContext.Provider>
  );
};

export const useBackendStatus = (): BackendStatusContextValue => {
  const ctx = useContext(BackendStatusContext);
  if (!ctx) throw new Error('useBackendStatus must be used within BackendStatusProvider');
  return ctx;
};
