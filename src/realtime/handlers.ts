import type { Server as IOServer } from "socket.io";

export function registerSocketHandlers(io: IOServer): void {
  io.on("connection", (socket) => {
    const userId = socket.data.user?.id as number | undefined;
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    socket.join(`user:${userId}`);
  });
}
