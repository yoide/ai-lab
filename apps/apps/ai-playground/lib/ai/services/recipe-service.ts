import { type Recipe, type RecipeRequest } from '../types';
import { client } from '../client';
import { zodTextFormat } from 'openai/helpers/zod.mjs';
import { RecipeSchema } from '../schemas';
import { RecipePromptV1 } from '../prompts';
import { AI_CONFIG } from '../config';
import { AIResponseError } from '../AIResponseError';
import { AILogger } from '../logger';

export const RecipeService = {
  async generate(request: RecipeRequest): Promise<Recipe> {
    AILogger.info('recipe_generation_started', {
      promptVersion: RecipePromptV1.version,
      model: AI_CONFIG.openai.model,
      request,
    });
    const response = await client.responses.parse({
      model: AI_CONFIG.openai.model,
      input: [
        {
          role: 'user',
          content: RecipePromptV1.build(request),
        },
      ],
      text: {
        format: zodTextFormat(RecipeSchema, 'recipe'),
      },
    });

    AILogger.info('recipe_generation_completed', {
      promptVersion: RecipePromptV1.version,
      model: AI_CONFIG.openai.model,
    });

    if (!response.output_parsed) {
      AILogger.info('recipe_generation_failed', {
        error: 'recipe not parsed',
      });
      throw new AIResponseError('Failed to generate recipe');
    }

    return response.output_parsed;
  },
};
