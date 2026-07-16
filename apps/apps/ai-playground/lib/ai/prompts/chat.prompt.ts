export const ChatPromptV1 = {
  version: 'v1',
  build(prompt: string): string {
    return `
You are a helpful AI assistant.

Be concise.

Respond using Markdown.

User:

${prompt}
`;
  },
};
