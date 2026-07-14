'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

type ChatResponse = {
  answer: string;
};

export default function ChatPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async () => {
    try {
      setStatus('loading');
      setAnswer('');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data: ChatResponse = await response.json();
      setStatus('success');
      setAnswer(data.answer);
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  };

  return (
    <main className="flex flex-col gap-4 p-8 max-w-2xl">
      <h1 className="text-3xl font-bold">AI Lab</h1>

      <textarea
        className="border border-neutral-300 dark:border-neutral-600 rounded-md p-4 focus:outline-none focus:border-neutral-500 focus:ring-2 focus:ring-blue-500/20 bg-transparent text-inherit"
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <button
        className="border border-neutral-300 dark:border-neutral-700 rounded-md px-4 py-2 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSubmit}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Loading...' : 'Ask AI'}
      </button>

      {status === 'success' && answer && (
        <div className="rounded-md bg-green-100 p-4">
          <p>✅ API responded successfully!</p>
          <p>{answer}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-md bg-red-100 p-4">❌ API request failed.</div>
      )}
    </main>
  );
}
