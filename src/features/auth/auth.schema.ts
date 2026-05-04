import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(1).max(10),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateProfileSchema = z.object({
  // email: z.string().email(), //kept these for later updates
  // password: z.string().min(8),
  username: z.string().min(1).max(10),
});
