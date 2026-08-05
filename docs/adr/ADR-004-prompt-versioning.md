# ADR-004: Prompt Versioning

## Status

Accepted

## Context

Prompts are behavior-defining artifacts: a wording change can alter output quality as much as a code change. Early on, prompts were inline strings inside services, which made it impossible to know which prompt produced a given output, to compare variants, or to roll back a regression. As an experimentation lab, we specifically need to iterate on prompts while keeping results attributable.

## Decision

Treat prompts as versioned, typed modules:

- Each prompt lives in its own file under `lib/ai/prompts/`, named with its version: `recipe-v1.prompt.ts`, `chat.prompt.ts`. Public prompts are re-exported from `lib/ai/prompts/index.ts`.
- A prompt module exports an object with an explicit `version` field and a `build(context)` function that takes a typed request (e.g. `RecipeRequest`) and returns the final prompt string. Interpolation is centralized in `build`, so callers never concatenate prompt text.
- A new prompt iteration is a new file/object (`RecipePromptV2`), not an edit to the existing one. Old versions remain in the codebase until deliberately removed, enabling side-by-side comparison and instant rollback by switching an import.
- Services log the prompt version on every call: `AILogger` events include `promptVersion` (e.g. `recipe_generation_started` logs `RecipePromptV1.version`), so any logged output can be traced to the exact prompt and model that produced it.

## Consequences

- Prompt changes show up in git as new files with clear diffs, and code review applies to prompt engineering the same as to code.
- Logs correlate outputs with `promptVersion` + `model`, which is the foundation for future A/B evaluation of prompt variants.
- Typed `build(context)` functions prevent missing-placeholder bugs at compile time.
- Keeping old versions adds files over time; pruning superseded prompts is a manual housekeeping task.
- Versioning is per-file convention, not enforced tooling — nothing stops an in-place edit of `RecipePromptV1`. Discipline (and review) must enforce "new version = new object". If the prompt count grows, a registry or eval harness can formalize this; that would extend, not replace, this decision.
