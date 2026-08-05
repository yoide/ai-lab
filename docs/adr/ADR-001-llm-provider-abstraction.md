# ADR-001: LLM Provider Abstraction

## Status

Accepted

## Context

The AI playground calls a large language model from several features (chat, recipe generation), and more experiments will follow. Coupling application code directly to the OpenAI SDK would spread vendor-specific types and API calls across routes and services, making it costly to:

- swap or add providers (Anthropic, local models) for comparison experiments, which is a core goal of this lab;
- test services without hitting a real API;
- change SDK versions or endpoints (e.g. Chat Completions → Responses API) in one place.

## Decision

Introduce a provider interface that hides the vendor SDK behind a minimal, app-owned contract:

- `LLMProvider` (`lib/ai/interfaces/llm.provider.ts`) defines the capability the app needs — currently `generateStream(request: StreamRequest): Promise<ReadableStream<Uint8Array>>` — in terms of app-owned types and web-standard streams, not SDK types.
- `OpenAIProvider` (`lib/ai/providers/openai-provider.ts`) is the only module that imports the `openai` SDK for chat. It implements `LLMProvider`, translates SDK stream events into a plain `ReadableStream<Uint8Array>`, and is exported as a singleton `aiProvider`.
- Services (`lib/ai/services/*`) depend on the interface and the exported provider instance, never on the SDK directly.
- Model name, temperature, and API key live in `AI_CONFIG` (`lib/ai/config.ts`) so provider settings are centralized rather than scattered.

The service layer mirrors this with its own interface, `IStreamingAIService<Request>`, so API routes depend on a service contract rather than a concrete implementation.

## Consequences

- Adding a new provider means writing one class that implements `LLMProvider`; services and routes are untouched.
- Services can be unit-tested with a fake provider that returns a canned `ReadableStream`.
- The interface is intentionally minimal and will need to grow (e.g. non-streaming generation, tool use, token usage reporting) as experiments require. Each addition should stay vendor-neutral.
- Known gap: `RecipeService` still imports the OpenAI client directly (`lib/ai/client.ts`) to use `responses.parse` for structured outputs, because the provider interface does not yet model structured generation. Bringing structured outputs behind the abstraction is a pending follow-up (see [ADR-002](ADR-002-structured-outputs.md)).
- Provider selection is currently hardcoded to the `aiProvider` singleton; a factory or env-based selection can be added when a second provider exists, without changing consumers.
