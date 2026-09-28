import { z } from "zod";

export const catSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters.").max(100),
  jobTitle: z.string().trim().min(2, "Job title is required.").max(150),
  email: z.string().trim().email("Enter a valid email address."),
  salary: z.coerce.number().finite().min(0, "Salary cannot be negative.").max(1000000),
  birthDate: z.string().refine((value) => {
    const date = new Date(`${value}T00:00:00`);
    return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
      !Number.isNaN(date.getTime()) &&
      date <= new Date();
  }, "Birth date must be a valid date and cannot be in the future."),
  remoteWorker: z.boolean(),
  livesRemaining: z.coerce.number().int("Lives must be an integer.").min(0).max(9),
  photoUrl: z.string().url().nullable().optional()
});

export type CatInput = z.infer<typeof catSchema>;
