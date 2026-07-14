import { RecipeService } from '@/lib/ai/services/recipe-service';
import { RecipeRequestSchema } from '@/lib/ai/schemas';

export async function POST(request: Request) {
  try {
    const body = RecipeRequestSchema.parse(await request.json());

    const recipe = await RecipeService.generate(body);

    return Response.json({ recipe });
  } catch (error) {
    console.error(error);

    return Response.json({ error: 'Failed to generate recipe' }, { status: 500 });
  }
}
