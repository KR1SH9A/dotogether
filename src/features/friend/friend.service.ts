import { EntityManager } from "@mikro-orm/postgresql";
import { FriendRequest, FriendRequestStatus } from "./FriendRequest.entity";

import { User } from "../auth/User.entity";
import { AppError } from "../../common/errors/AppError";

export class FriendService {
  constructor(private em: EntityManager) {}

  //service for sending friend requests with some cases handled
  async sendRequest(senderId: number, receiverId: number) {
    if (senderId == receiverId) {
      throw new AppError(
        "Oops! you can be friend to yourself but not like this lol",
        400,
      );
    }
    const sender = await this.em.findOne(User, { id: senderId });
    const receiver = await this.em.findOne(User, { id: receiverId });

    if (!sender || !receiver) {
      throw new AppError(
        "Looks like this person doesn't exist on the platform yet",
        404,
      );
    }

    const existing = await this.em.findOne(FriendRequest, {
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    });
    if (existing) {
      throw new AppError("Request already made", 400);
    }

    const req = new FriendRequest();

    req.sender = sender;
    req.receiver = receiver;
    req.status = FriendRequestStatus.PENDING;

    this.em.persist(req);
    await this.em.flush();

    return {
      id: req.id,
      status: req.status,
      receiver: { id: receiverId, email: receiver.email },
    };
  }

  //now we handle accept :) or reject :( for friend requests
  async respondToRequest(
    requestId: number,
    action: "accept" | "reject",
    currentUserId: number,
  ) {
    const req = await this.em.findOne(
      FriendRequest,
      {
        id: requestId,
      },
      {
        populate: ["sender", "receiver"],
      },
    );

    if (!req) {
      throw new AppError("Friend request not found", 404);
    }

    if (req.receiver.id == currentUserId) {
      throw new AppError("This is not allowed :(", 403);
    }

    req.status =
      action === "accept"
        ? FriendRequestStatus.ACCEPTED
        : FriendRequestStatus.REJECTED;

    await this.em.flush();

    return {
      id: req.id,
      status: req.status,
    };
  }

  //list the available friends
  async myFriends(userId: number) {
    const requests = await this.em.find(
      FriendRequest,
      {
        status: FriendRequestStatus.ACCEPTED,
        $or: [{ sender: userId }, { receiver: userId }],
      },
      { populate: ["sender", "receiver"] },
    );

    return requests.map((r) => {
      const other = r.sender.id === userId ? r.receiver : r.sender;

      return {
        id: other.id,
        email: other.email,
      };
    });
  }

  //Pending requests for user
  async pendingReq(userId: number) {
    const requests = await this.em.find(
      FriendRequest,
      {
        receiver: userId,
        status: FriendRequestStatus.PENDING,
      },
      {
        populate: ["sender"],
      },
    );
    return requests.map((r) => ({
      id: r.id,
      sender: {
        id: r.sender.id,
        email: r.sender.email,
      },
    }));
  }
}
