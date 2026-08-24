import type { IStreamingAIService } from '../interfaces/streaming-ai.service';
import { aiProvider } from '../providers/openai-provider';
import type { ChatRequest } from '../types/chat.type';
import { AI_CONFIG } from '../config';

export const chatService: IStreamingAIService<ChatRequest> = {
  async generateStream(request: ChatRequest) {
    const { messages } = request;
    return aiProvider.generateStream({
      model: AI_CONFIG.openai.model,
      messages,
    });
  },
};
