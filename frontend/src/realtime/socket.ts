import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, '') ?? '';

export function connectSocket(sessionId: string): Socket {
  if (socket && socket.connected) return socket;
  if (socket) {
    socket.auth = { sessionId };
    socket.connect();
    return socket;
  }
  socket = io(BASE_URL, {
    auth: { sessionId },
    autoConnect: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
  });
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
