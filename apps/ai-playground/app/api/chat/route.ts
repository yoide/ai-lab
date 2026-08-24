import { chatService } from '@/lib/ai/services/chat.service';
import type { ChatRequest } from '@/lib/ai/types/chat.type';

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();

    if (!Array.isArray(body.messages)) {
      return Response.json({ error: 'Messages are required' }, { status: 400 });
    }

    const stream = await chatService.generateStream(body);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);

    return Response.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
