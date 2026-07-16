import { chatService } from '@/lib/ai/services/chat.service';

export async function POST(request: Request) {
  const body = await request.json();

  const stream = await chatService.generateStream(body);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
