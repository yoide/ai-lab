import OpenAI from 'openai';
import type { LLMProvider } from '../interfaces/llm.provider';
import type { StreamRequest } from '../types/chat.type';
import { ChatPromptV1 } from '../prompts/chat.prompt';

class OpenAIProvider implements LLMProvider {
  private readonly client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async generateStream(request: StreamRequest): Promise<ReadableStream<Uint8Array>> {
    const input = ChatPromptV1.build(request);

    const stream = await this.client.responses.create({
      model: request.model,
      input,
      stream: true,
    });

    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'response.output_text.delta') {
              controller.enqueue(encoder.encode(event.delta));
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }
}

export const aiProvider = new OpenAIProvider();
