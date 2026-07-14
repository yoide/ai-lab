import OpenAI from 'openai';
import { AI_CONFIG } from './config';

export const client = new OpenAI({
  apiKey: AI_CONFIG.openai.apiKey,
});
