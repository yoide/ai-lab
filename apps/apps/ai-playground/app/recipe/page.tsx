'use client';

import { useState } from 'react';
import type { Recipe } from '@/lib/ai/types';

const TIME_OPTIONS = [15, 30, 45, 60];

export default function RecipePage() {
  const [ingredient, setIngredient] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [maxTimeMinutes, setMaxTimeMinutes] = useState(30);

  const [recipe, setRecipe] = useState<Recipe | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addIngredient() {
    const value = ingredient.trim();

    if (!value) return;

    if (ingredients.some((i) => i.toLowerCase() === value.toLowerCase())) {
      setError('Ingredient already added.');
      return;
    }

    setIngredients([...ingredients, value]);
    setIngredient('');
    setError('');
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  async function generateRecipe() {
    if (ingredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    setLoading(true);
    setRecipe(null);
    setError('');

    try {
      const response = await fetch('/api/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients,
          maxTimeMinutes,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setRecipe(data.recipe);
    } catch {
      setError('Failed to generate recipe.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
      <div className="rounded-xl border p-6 shadow">
        <h1 className="mb-6 text-3xl font-bold">🍳 Calm Mom</h1>

        <div className="flex gap-2">
          <input
            className="flex-1 rounded border p-2"
            placeholder="Chicken..."
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addIngredient();
              }
            }}
          />

          <button onClick={addIngredient} className="rounded bg-blue-600 px-4 py-2 text-white">
            Add
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {ingredients.map((ingredient, index) => (
            <button
              key={ingredient}
              onClick={() => removeIngredient(index)}
              className="rounded-full bg-gray-200 px-3 py-1 text-sm"
            >
              {ingredient} ✕
            </button>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-3 font-semibold">Preparation Time</h2>

          <div className="flex gap-4">
            {TIME_OPTIONS.map((time) => (
              <label key={time} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={maxTimeMinutes === time}
                  onChange={() => setMaxTimeMinutes(time)}
                />
                {time} min
              </label>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <button
          onClick={generateRecipe}
          disabled={loading}
          className="mt-8 rounded bg-green-600 px-6 py-3 text-white disabled:bg-gray-400"
        >
          {loading ? 'Generating...' : 'Generate Recipe'}
        </button>
      </div>

      {recipe && (
        <div className="rounded-xl border p-6 shadow">
          <h2 className="text-2xl font-bold">{recipe.title}</h2>

          <p className="mt-2">⏱ {recipe.timeMinutes} minutes</p>

          <h3 className="mt-6 font-semibold">Ingredients</h3>

          <ul className="list-disc pl-6">
            {recipe.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>

          <h3 className="mt-6 font-semibold">Steps</h3>

          <ol className="list-decimal pl-6">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </main>
  );
}
