# ADR-003: Streaming Responses via Web Streams

## Status

Accepted

## Context

Chat-style interactions feel slow when the client must wait for the full completion: time-to-first-token is seconds even when total generation takes much longer. The app runs on Next.js App Router route handlers, which natively accept a `ReadableStream` as a `Response` body. We had to choose how model tokens travel from the provider SDK to the browser, and which layer knows about streaming mechanics.

## Decision

Stream tokens end-to-end using web-standard streams, with each layer exposing only `ReadableStream<Uint8Array>`:

- The provider (`OpenAIProvider.generateStream`) calls the OpenAI Responses API with `stream: true`, iterates the SDK's async event stream, filters `response.output_text.delta` events, and encodes each delta into a `ReadableStream<Uint8Array>` via `TextEncoder`. SDK-specific event types never leave the provider.
- Errors during iteration are forwarded with `controller.error(error)`, so consumers see a failed stream rather than a silent truncation.
- The service layer (`chatService`, typed as `IStreamingAIService<ChatRequest>`) composes the prompt and model config and passes the provider's stream through untouched.
- The route handler (`app/api/chat/route.ts`) returns the stream directly: `new Response(stream, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' })`. Plain text chunks, no SSE framing.
- Non-interactive flows that need a complete validated object (recipe generation, [ADR-002](ADR-002-structured-outputs.md)) intentionally do not stream.

## Consequences

- Time-to-first-token is minimized and no layer buffers the full response in memory.
- `ReadableStream` is the platform standard shared by the OpenAI SDK, Next.js, and browser `fetch`, so no adapter code or extra dependencies are needed, and the abstraction stays vendor-neutral.
- Plain-text streaming is the simplest client contract, but it cannot carry metadata (token usage, tool calls, error details mid-stream). If those are needed, the contract should move to SSE or a structured chunk protocol — that would be a new ADR superseding this one.
- Mid-stream failures reach the client as an aborted body after a 200 status has already been sent; clients must treat an abruptly closed stream as an error, not a short answer.
- Streaming responses are harder to log and evaluate than complete ones; observability hooks (e.g. teeing the stream to the logger) are a known follow-up.
