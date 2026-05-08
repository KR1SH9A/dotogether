import express from "express";
import cors from "cors";
import { InitORM } from "./database/InitORM.js";

//controllers here
import authRouter from "./features/auth/auth.controller.js";
import friendRouter from "./features/friend/friend.controller.js";
import todoRouter from "./features/todo/todo.controller.js";

//middleware here
import { errorMiddleWare } from "./common/middleware/error.middleware.js";

const dotogether = express();
dotogether.use(cors({
  // origin: process.env.ALLOWED_ORIGIN === "*" ? true : (process.env.ALLOWED_ORIGIN || true),
    origin: process.env.ALLOWED_ORIGIN,
  credentials: true,
}));
dotogether.use(express.json());

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

dotogether.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default dotogether;
