import type { Server as IOServer } from "socket.io";

let ioInstance: IOServer | null = null;

export function setIO(io: IOServer): void {
  ioInstance = io;
}

export function getIO(): IOServer {
  if (!ioInstance) {
    throw new Error("Socket.io is not initialized yet");
  }
  return ioInstance;
}

export function emitToUser(userId: number, event: string, payload: unknown): void {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
}

export function emitToUsers(userIds: number[], event: string, payload: unknown): void {
  const unique = new Set(userIds);
  for (const id of unique) emitToUser(id, event, payload);
}
