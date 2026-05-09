import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

type WarmupState = 'pending' | 'waking' | 'ready';

export interface BackendWarmupResult {
  state: WarmupState;
}

export function useBackendWarmup(): BackendWarmupResult {
  const [state, setState] = useState<WarmupState>('pending');

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      setState(s => s === 'pending' ? 'waking' : s);
    }, 1500);

    apiClient.get('/health', { signal: controller.signal, timeout: 60_000 })
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        setState('ready');
      });

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, []);

  return { state };
}
