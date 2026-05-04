import express from "express";
import cors from "cors";
import "reflect-metadata";
import { InitORM } from "./database/InitORM";

//controllers here
import authRouter from "./features/auth/auth.controller";
import friendRouter from "./features/friend/friend.controller";
import todoRouter from "./features/todo/todo.controller";

//middleware here
import { errorMiddleWare } from "./common/middleware/error.middleware";

const start = async () => {
  const dotogether = express();
  dotogether.use(cors());
  dotogether.use(express.json());

  const orm = await InitORM();

  dotogether.use((req: any, _res, next) => {
    req.em = orm.em.fork();
    next();
  });

  //routes are here, I am making the rest of them
  dotogether.use("/auth", authRouter);
  dotogether.use("/friends", friendRouter);
  dotogether.use("/todos", todoRouter);

  dotogether.use(errorMiddleWare);

  dotogether.listen(3000, () => {
    console.log("DoTogether is running here -> http://localhost:3000");
  });
};

start();
