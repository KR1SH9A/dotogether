import { Router } from "express";
import { validate } from "../../common/middleware/validate.middleware.js";
import { FriendService } from "./friend.service.js";
import {
  sendFriendRequestSchema,
  respondFriendRequestSchema,
} from "./friend.schema.js";
import { requireUser } from "../../common/middleware/auth.middleware.js";

const friendRouter = Router();

//I made a simple make-sure to be auth-ed to check friends
friendRouter.use(requireUser);

//sending friend request
friendRouter.post("/request", async (req: any, res, next) => {
  try {
    const parsed = sendFriendRequestSchema.parse(req.body);

    const service = new FriendService(req.em);

    const result = await service.sendRequest(req.user.id, parsed.email);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

//accepting or rejecting friend request
friendRouter.post("/respond", async (req: any, res, next) => {
  try {
    const parsed = respondFriendRequestSchema.parse(req.body);

    const service = new FriendService(req.em);

    const response = await service.respondToRequest(
      parsed.requestId,
      parsed.action,
      req.user.id,
    );

    res.json(response);
  } catch (err) {
    next(err);
  }
});

//list my friends here
friendRouter.get("/myfriends", async (req: any, res, next) => {
  try {
    const service = new FriendService(req.em);
    const friends = await service.myFriends(req.user.id);
    res.json(friends);
  } catch (err) {
    next(err);
  }
});

//listing pending friend requests
friendRouter.get("/pending", async (req: any, res, next) => {
  try {
    const service = new FriendService(req.em);
    const list = await service.pendingReq(req.user.id);

    res.json(list);
  } catch (err) {
    next(err);
  }
});

export default friendRouter;
