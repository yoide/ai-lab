# ADR-002: Structured Outputs with Zod Schemas

## Status

Accepted

## Context

The recipe feature needs the model to return machine-readable data (title, ingredients, steps, tips) that the UI can render directly. Free-text responses parsed with regex or `JSON.parse` on prompt-instructed JSON are fragile: the model can omit fields, change shapes, or wrap JSON in prose. We need a single source of truth for the shape of AI responses that is enforced both at the API boundary and against the model itself.

## Decision

Use Zod schemas as the single source of truth for AI data shapes, and use the provider's native structured-output support to enforce them at generation time:

- Schemas live in `lib/ai/schemas.ts`. `RecipeSchema` defines the model's output; `RecipeRequestSchema` validates incoming HTTP request bodies.
- TypeScript types (`lib/ai/types/types.ts`) are derived from these schemas, so compile-time types and runtime validation cannot drift apart.
- `RecipeService` calls the OpenAI Responses API with `responses.parse` and `zodTextFormat(RecipeSchema, 'recipe')`, so the schema is passed to the model as a strict output format rather than described in prose inside the prompt.
- If the SDK returns no `output_parsed`, the service throws a domain-specific `AIResponseError` (`lib/ai/AIResponseError.ts`) instead of leaking `undefined` downstream. The API route (`app/api/recipe/route.ts`) maps failures to a 500 with a generic message.
- The same schemas validate at both edges: `RecipeRequestSchema.parse` guards input before the AI call, and the format guards output after it.

## Consequences

- The UI can consume `Recipe` objects without defensive parsing; a schema change is a single edit that propagates to types, validation, and the model format.
- Structured generation constrains decoding on the provider side, which largely eliminates malformed-JSON failures rather than merely detecting them.
- `zodTextFormat` ties this flow to the OpenAI SDK, which is why `RecipeService` bypasses the `LLMProvider` abstraction from [ADR-001](ADR-001-llm-provider-abstraction.md). When a second provider is added, the provider interface should gain a `generateStructured(schema, request)` capability and each provider should map the Zod schema to its native mechanism (e.g. JSON schema / tool use).
- Strict schemas mean prompt or product changes that add fields require coordinated schema updates; this is intended friction.
- Validation failures surface as thrown errors, so every caller must handle `AIResponseError` (currently via the route's try/catch).
