import type { Socket } from "socket.io";
import type { MikroORM } from "@mikro-orm/postgresql";
import { Session } from "../features/auth/Session.entity.js";

export function makeSocketAuth(orm: MikroORM) {
  return async (socket: Socket, next: (err?: Error) => void) => {
    try {
      const sessionId = socket.handshake.auth?.sessionId as string | undefined;
      if (!sessionId) {
        return next(new Error("unauthorized: missing sessionId"));
      }

      const em = orm.em.fork();
      const session = await em.findOne(
        Session,
        { id: sessionId },
        { populate: ["user"] },
      );

      if (!session) {
        return next(new Error("unauthorized: invalid session"));
      }

      socket.data.user = { id: session.user.id, username: session.user.username };
      next();
    } catch (err) {
      next(err instanceof Error ? err : new Error("auth failed"));
    }
  };
}
