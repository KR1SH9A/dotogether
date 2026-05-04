import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  receiverId: z.number().int().positive(),
});

export const respondFriendRequestSchema = z.object({
  requestId: z.number().int().positive(),
  action: z.enum(["accept", "reject"]),
});
