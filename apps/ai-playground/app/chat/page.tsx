'use client';

import { type Message } from '@/lib/ai/models/message';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!prompt.trim() || loading) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: prompt,
      };

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
      };

      const conversation = [...messages, userMessage];

      setMessages([...conversation, assistantMessage]);

      setPrompt('');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversation,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      if (!response.body) {
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        accumulated += decoder.decode(value, {
          stream: true,
        });

        setMessages((previous) =>
          previous.map((message) =>
            message.id === assistantMessage.id
              ? {
                  ...message,
                  content: accumulated,
                }
              : message,
          ),
        );
      }
    } catch (error) {
      console.error(error);
      setError('Failed to generate response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">AI Lab Chat</h1>

        <p className="text-zinc-400">Experimenting with OpenAI Streaming Responses.</p>
      </header>

      {(loading || messages.length > 0) && (
        <div className="flex flex-col gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-xl p-5 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white self-end max-w-[80%]'
                  : 'bg-zinc-900 border border-zinc-700 self-start max-w-[80%]'
              }`}
            >
              <p className="mb-2 text-sm font-semibold">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </p>

              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          placeholder="Ask me anything..."
          className="
        w-full
        resize-none
        rounded-xl
        border
        border-zinc-700
        bg-zinc-900
        p-4
        text-zinc-100
        placeholder:text-zinc-500
        outline-none
        transition
        focus:border-blue-500
      "
        />

        <div className="flex justify-end">
          <button
            onClick={handleSend}
            disabled={loading || !prompt.trim()}
            className="
          rounded-xl
          bg-blue-600
          px-6
          py-3
          font-medium
          text-white
          transition
          hover:bg-blue-500
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
          >
            {loading ? 'Generating...' : 'Send'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950 p-4 text-red-300">{error}</div>
      )}
    </main>
  );
}
