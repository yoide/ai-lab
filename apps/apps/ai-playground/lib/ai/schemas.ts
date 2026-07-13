import { z } from "zod";

export const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  timeMinutes: z.number(),
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
  substitutions: z.array(z.string()),
  tips: z.array(z.string()),
});