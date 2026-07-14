// Restore these when the handler body below is uncommented.
// import { recipePromtV1 } from '@/lib/ai/prompts';
//
// type ChatRequest = {
//   prompt: string;
// };

export async function POST(_request: Request) {
  /*   try {
    const body: ChatRequest = await request.json();

    if (
      typeof body.prompt !== "string" ||
      body.prompt.trim().length === 0
    ) {
      return Response.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const answer = await recipePromtV1.build(body.prompt);

    return Response.json({ answer });
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  } */
}
