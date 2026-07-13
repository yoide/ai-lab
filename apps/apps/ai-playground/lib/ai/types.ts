import { z } from "zod";
import { RecipeSchema } from "./schemas";

export type Recipe = z.infer<typeof RecipeSchema>;