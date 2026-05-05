import { Router } from "express";
import { AuthService } from "./auth.service.js";
import { validate } from "../../common/middleware/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "./auth.schema.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validate(registerSchema),
  async (req: any, res, next) => {
    try {
      const service = new AuthService(req.em);

      const user = await service.register(
        req.body.email,
        req.body.password,
        req.body.username,
      );

      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post(
  "/login",
  validate(loginSchema),
  async (req: any, res, next) => {
    try {
      const service = new AuthService(req.em);
      const user = await service.login(req.body.email, req.body.password);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },
);

authRouter.post("/logout", async (req: any, res, next) => {
  try {
    const service = new AuthService(req.em);
    await service.logout(req.headers["x-session-id"]);
    res.json({ message: "You have logged out successfully" });
  } catch (err) {
    next(err);
  }
});

authRouter.patch("/me", async (req: any, res, next) => {
  try {
    const parsed = updateProfileSchema.parse(req.body);
    const service = new AuthService(req.em);
    const result = await service.updateProfile(req.user.id, parsed);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default authRouter;
