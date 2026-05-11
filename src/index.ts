import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server as IOServer } from "socket.io";
import { InitORM } from "./database/InitORM.js";

//controllers here
import authRouter from "./features/auth/auth.controller.js";
import friendRouter from "./features/friend/friend.controller.js";
import todoRouter from "./features/todo/todo.controller.js";

//middleware here
import { errorMiddleWare } from "./common/middleware/error.middleware.js";

//realtime
import { setIO } from "./realtime/io.js";
import { makeSocketAuth } from "./realtime/socketAuth.js";
import { registerSocketHandlers } from "./realtime/handlers.js";

const dotogether = express();

const server = createServer(dotogether);

dotogether.use(cors({
  // origin: process.env.ALLOWED_ORIGIN === "*" ? true : (process.env.ALLOWED_ORIGIN || true),
    origin: process.env.ALLOWED_ORIGIN,
  credentials: true,
}));
dotogether.use(express.json());

dotogether.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV ?? 'development',
  });
});

let ormInstance: any = null;


dotogether.use(async (req: any, _res, next) => {
  try {
    if (!ormInstance) {
      ormInstance = await InitORM();
    }
    req.em = ormInstance.em.fork();
    next();
  } catch (err) {
    next(err);
  }
});

const apiRouter = express.Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/friends", friendRouter);
apiRouter.use("/todos", todoRouter);

// Mount all backend routes under /api
dotogether.use("/api", apiRouter);

dotogether.use(errorMiddleWare);


const PORT = process.env.PORT || 3000;

async function start() {
  const orm = await InitORM();
  ormInstance = orm;

  const io = new IOServer(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN,
      credentials: true,
    },
  });
  io.use(makeSocketAuth(orm));
  registerSocketHandlers(io);
  setIO(io);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default dotogether;
