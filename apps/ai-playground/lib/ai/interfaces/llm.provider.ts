import type { StreamRequest } from '../types/chat.type';

export interface LLMProvider {
  generateStream(request: StreamRequest): Promise<ReadableStream<Uint8Array>>;
}
