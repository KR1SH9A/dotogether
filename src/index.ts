import express from "express";
import cors from "cors";
import "reflect-metadata";
import { InitORM } from "./database/InitORM.js";

//controllers here
import authRouter from "./features/auth/auth.controller.js";
import friendRouter from "./features/friend/friend.controller.js";
import todoRouter from "./features/todo/todo.controller.js";

//middleware here
import { errorMiddleWare } from "./common/middleware/error.middleware.js";

const dotogether = express();
dotogether.use(cors({
  origin: process.env.ALLOWED_ORIGIN === "*" ? true : (process.env.ALLOWED_ORIGIN || true),
  credentials: true,
}));
dotogether.use(express.json());

let ormInstance: any = null;

// Lazy initialize ORM for Vercel Serverless cold starts
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

// Only listen locally, Vercel will export the app
//not hosted on vercel
if (process.env.NODE_ENV !== "production") {
  dotogether.listen(3000, () => {
    console.log("DoTogether is running here -> http://localhost:3000");
  });
}

export default dotogether;
