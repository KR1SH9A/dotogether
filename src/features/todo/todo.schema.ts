import { z } from "zod";

export const createTodoSchema = z.object({
  name: z.string().min(1),
  about: z.string().optional(),
  reminderTime: z.coerce.date().nullable().optional(),
});

export const updateTodoSchema = z.object({
  name: z.string().optional(),
  about: z.string().optional(),
  reminderTime: z.coerce.date().nullable().optional(),
});

export const addParticipantsSchema = z.object({
  userIds: z.array(z.number()),
});
