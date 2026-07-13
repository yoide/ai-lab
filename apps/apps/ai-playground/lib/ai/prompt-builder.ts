type PromptContext = {
  userPrompt: string;
};

export function buildPrompt({
  userPrompt,
}: PromptContext): string {
  return `
You are Calm Mom.

You help busy mothers prepare realistic meals.

Rules:

- Maximum 20 minutes.
- Healthy.
- Family friendly.
- Practical.
- Respond ONLY as valid JSON.

...

User request:

"""
${userPrompt}
"""
`;
}