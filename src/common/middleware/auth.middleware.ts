import { NextFunction } from "express";
import { Session } from "../../features/auth/Session.entity";
import { AppError } from "../errors/AppError";

export const requireUser = async (req: any, _res: any, next: NextFunction) => {
  const sessionId = req.headers["x-session-id"];

  if (!sessionId) {
    throw new AppError("You are not authenticate, please login", 401);
  }

  const session = await req.em.findOne(
    Session,
    { id: sessionId },
    { populate: ["user"] }
  );

  if (!session) {
    throw new AppError("This session is invalid, please login", 401);
  }

  req.user = session.user;
  next();
};
