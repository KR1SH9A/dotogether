import { z } from "zod";

export const sendFriendRequestSchema = z.object({
  email: z.string().email(),
});

export const respondFriendRequestSchema = z.object({
  requestId: z.number().int().positive(),
  action: z.enum(["accept", "reject"]),
});
