'use client';

import { useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function HelloPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleClick = async () => {
    try {
      setStatus('loading');
      setMessage('');

      const response = await fetch('/api/hello');

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setStatus('success');
      setMessage(data.message);
    } catch (err) {
      setStatus('error');
      console.error(err);
    }
  };

  return (
    <main className="flex flex-col gap-4 p-8">
      <h1 className="text-3xl font-bold">Hello AI Lab 👋</h1>

      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="px-4 py-2 rounded-md bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Loading...' : 'Get Hello'}
      </button>

      {status === 'success' && message && (
        <div className="rounded-md bg-green-100 p-4">
          <p>✅ API responded successfully!</p>
          <p>{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-md bg-red-100 p-4">❌ API request failed.</div>
      )}
    </main>
  );
}
