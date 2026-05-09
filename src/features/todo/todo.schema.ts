import { z } from "zod";
import { ReactionType } from "./TodoReaction.entity.js";

export const createTodoSchema = z.object({
  name: z.string().min(1),
  about: z.string().optional(),
  reminderTime: z.coerce.date().nullable().optional(),
});

export const updateTodoSchema = z.object({
  name: z.string().min(1).optional(),
  about: z.string().optional(),
  reminderTime: z.coerce.date().nullable().optional(),
});

export const addParticipantsSchema = z.object({
  userIds: z.array(z.number().int().positive()),
});

export const reactionSchema = z.object({
  reaction: z.nativeEnum(ReactionType),
});
