import { type z } from 'zod';
import { type RecipeSchema } from '../schemas';

export type Recipe = z.infer<typeof RecipeSchema>;

export type RecipeRequest = {
  ingredients: string[];
  maxTimeMinutes: number;
};

export type ChatRequest = {
  prompt: string;
};
