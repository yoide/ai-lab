# Architecture

## Overview

AI Lab follows a layered architecture designed to isolate application logic from AI provider implementations.

The current architecture is:

```text
Browser
   ↓
Next.js Route Handler
   ↓
AI Service
   ↓
LLM Provider Interface
   ↓
Provider Implementation
   ↓
Provider SDK
   ↓
AI Provider API
```

The main architectural goal is to prevent provider-specific SDKs from leaking into the application.

---

# Layers

## 1. Presentation Layer

The presentation layer is implemented using Next.js pages and React components.

Responsibilities:

- Render the user interface.
- Capture user input.
- Maintain temporary UI state.
- Display streaming responses.
- Render Markdown responses.

The frontend should not know how the AI provider works.

Example:

```text
app/chat/
```

The frontend communicates with the backend through HTTP.

---

# 2. API Layer

Next.js Route Handlers expose the application's HTTP API.

Example:

```text
app/api/chat/route.ts
```

Responsibilities:

- Receive HTTP requests.
- Parse request bodies.
- Validate input.
- Call the appropriate service.
- Return HTTP responses.
- Handle HTTP-level errors.

The route must not contain:

- Prompt construction.
- OpenAI SDK calls.
- Provider-specific logic.
- AI business logic.

Conceptually:

```ts
export async function POST(request: Request) {
  const body = await request.json();

  const result = await chatService.generateStream(body);

  return new Response(result);
}
```

---

# 3. Service Layer

Services represent application-level AI use cases.

Example:

```text
lib/ai/services/chat-service.ts
```

Responsibilities:

- Orchestrate the use case.
- Select the appropriate prompt.
- Call the provider abstraction.
- Apply application-level AI rules.

The service should not know which provider is being used.

Example:

```text
ChatService
    ↓
LLMProvider
```

Not:

```text
ChatService
    ↓
OpenAI SDK
```

This allows the provider implementation to change without changing the application use case.

---

# 4. Provider Abstraction

The provider interface defines the contract between the application and an AI provider.

Example:

```ts
export interface LLMProvider {
  generateStream(request: StreamRequest): Promise<ReadableStream<Uint8Array>>;
}
```

The interface represents what the application needs from an LLM.

It does not expose:

- OpenAI types.
- OpenAI SDK classes.
- OpenAI response objects.
- Provider-specific streaming events.

This creates a boundary between the application and external AI providers.

---

# 5. Provider Implementation

Provider implementations contain all provider-specific code.

Current implementation:

```text
lib/ai/providers/openai-provider.ts
```

The OpenAI provider is responsible for:

- Creating the OpenAI client.
- Calling the Responses API.
- Configuring streaming.
- Processing OpenAI streaming events.
- Converting provider-specific output into the application's streaming contract.

Example:

```text
OpenAIProvider
      ↓
OpenAI SDK
      ↓
Responses API
```

The rest of the application should never import the OpenAI SDK directly.

---

# 6. Streaming Boundary

OpenAI exposes its own streaming abstraction:

```text
ResponseStream
```

This type is intentionally not exposed outside the provider.

Instead, the provider converts the OpenAI stream into:

```ts
ReadableStream<Uint8Array>;
```

This is the application's streaming contract.

The flow is:

```text
OpenAI ResponseStream
        ↓
OpenAIProvider
        ↓
response.output_text.delta
        ↓
TextEncoder
        ↓
ReadableStream<Uint8Array>
        ↓
HTTP Response
        ↓
Browser
        ↓
TextDecoder
        ↓
UI
```

This abstraction prevents OpenAI-specific streaming types from leaking into the service or presentation layers.

---

# 7. Prompt Layer

Prompts are treated as versioned application assets.

Example:

```text
lib/ai/prompts/chat.prompt.ts
```

Each capability has its own prompt.

Examples:

```text
RecipePromptV1
ChatPromptV1
```

Prompt versions are immutable.

If the prompt changes significantly, a new version should be created:

```text
ChatPromptV1
ChatPromptV2
```

rather than silently modifying the existing prompt.

This allows future evaluation and comparison between prompt versions.

---

# 8. Conversation Model

The chat application represents conversation history as a collection of messages.

```ts
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};
```

A chat request contains the current conversation:

```ts
export type ChatRequest = {
  messages: Message[];
};
```

The frontend maintains the conversation state.

When the user sends a new message:

```text
Existing messages
       +
New user message
       ↓
ChatRequest
       ↓
Backend
```

The assistant response is initially represented by an empty assistant message and progressively populated as streaming chunks arrive.

---

# 9. Conversation Context

The current implementation uses the conversation history as model context.

For example:

```text
User:
What is Docker?

Assistant:
Docker is a containerization platform.

User:
How is it different from a VM?
```

The complete conversation is sent to the model.

This is **conversation history**, not long-term memory.

The current architecture does not yet implement:

- Conversation persistence.
- Context summarization.
- Token-based context management.
- Long-term memory.
- Semantic retrieval.

These are future capabilities.

---

# 10. Structured Outputs

Structured AI use cases use Zod schemas to define the expected output structure.

Example:

```text
RecipeSchema
```

The flow is:

```text
User Request
      ↓
Prompt
      ↓
LLM
      ↓
Structured Output
      ↓
Zod Schema
      ↓
Typed Domain Object
```

This is primarily used for deterministic application features such as the Recipe use case.

Conversational chat uses streaming instead.

---

# 11. Recipe vs Chat

AI Lab intentionally contains multiple AI use cases.

### Recipe

Used to explore:

- Structured Outputs.
- Zod.
- Prompt versioning.
- Typed AI responses.
- Validation.

### Chat

Used to explore:

- Streaming.
- Conversation context.
- Message models.
- Provider abstraction.
- Conversational UI.

Neither is intended to become the primary product.

They are practical reference implementations for different AI Engineering patterns.

---

# 12. Dependency Direction

Dependencies should point toward abstractions.

Preferred:

```text
Route
  ↓
Service
  ↓
LLMProvider
  ↑
OpenAIProvider
```

The service depends on the interface.

The concrete provider implements the interface.

This allows another provider to be introduced later:

```text
             LLMProvider
             ↑         ↑
             │         │
      OpenAIProvider  OtherProvider
```

The service does not need to change.

---

# 13. Provider Independence

The goal is not to abstract every difference between AI providers.

The goal is to prevent provider-specific implementation details from leaking into the application.

For example, this should remain inside the OpenAI provider:

```ts
client.responses.create(...)
```

and:

```ts
event.type === "response.output_text.delta";
```

The application should instead work with its own abstractions:

```ts
LLMProvider;
```

and:

```ts
ReadableStream<Uint8Array>;
```

---

# 14. Error Boundaries

Errors should be handled at the appropriate layer.

### Provider

Responsible for provider-specific failures.

Examples:

- API errors.
- Authentication errors.
- Provider streaming errors.

### Service

Responsible for application-level AI errors.

Examples:

- Invalid use-case state.
- Unsupported operation.
- Context limitations.

### Route

Responsible for converting failures into HTTP responses.

Example:

```text
Provider Error
      ↓
Service
      ↓
Route
      ↓
HTTP 500
```

A future shared error model should standardize this behavior.

---

# 15. Repository Structure

```text
app/

    api/
        chat/
        recipe/

    chat/
    recipe/

lib/

    ai/

        interfaces/
            llm.provider.ts

        providers/
            openai-provider.ts

        prompts/
            chat.prompt.ts
            recipe.prompt.ts

        schemas/
            recipe.schema.ts

        services/
            chat-service.ts
            recipe-service.ts

        types/
            chat.type.ts
            recipe.type.ts

        client.ts

docs/

    adr/
    PROJECT_CONTEXT.md
    architecture.md
    ROADMAP.md
    CHANGELOG.md
```

---

# Architectural Evolution

The current architecture is intentionally simple.

Future capabilities may introduce additional components.

For example:

```text
Route
  ↓
Service
  ↓
Context Manager
  ↓
Prompt
  ↓
LLM Provider
  ↓
Provider SDK
```

Later:

```text
                 ┌── Memory
                 │
Route → Service → Context Manager → Prompt → Provider
                 │
                 ├── RAG
                 │
                 └── Tools
```

These components should only be introduced when a real use case requires them.

The architecture should evolve with the capabilities being explored rather than anticipating every possible AI pattern upfront.
