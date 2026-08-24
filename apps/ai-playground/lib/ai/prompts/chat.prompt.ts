import type { ChatRequest } from '../types/chat.type';

export const ChatPromptV1 = {
  version: 'v1',

  build: (request: ChatRequest) => {
    return [
      {
        role: 'system' as const,
        content: 'You are a helpful AI assistant.',
      },

      ...request.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];
  },
};
