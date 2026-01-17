'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import RecipeCard from '@/components/recipes/recipe-card'

interface Recipe {
  id: string
  title: string
  description: string | null
  cookTime: number | null
  servings: number | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  primaryImage: string | null
  author: {
    username: string
    avatarUrl: string | null
  }
}

interface LoadMoreButtonProps {
  initialRecipes: Recipe[]
}

export default function LoadMoreButton({ initialRecipes }: LoadMoreButtonProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(12)

  const loadMore = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from('recipes')
      .select(`
        id,
        title,
        description,
        cook_time,
        servings,
        difficulty,
        profiles:user_id (
          username,
          avatar_url
        ),
        recipe_images!left (
          image_url,
          is_primary
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + 11)

    if (data) {
      const newRecipes = data.map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        cookTime: recipe.cook_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        primaryImage: recipe.recipe_images?.find((img: any) => img.is_primary)?.image_url || null,
        author: {
          username: recipe.profiles?.username || 'Unknown',
          avatarUrl: recipe.profiles?.avatar_url || null,
        },
      }))

      setRecipes([...recipes, ...newRecipes])
      setOffset(offset + 12)
      
      // Check if there are more recipes
      if (newRecipes.length < 12) {
        setHasMore(false)
      }
    }

    setLoading(false)
  }

  // Don't show button if initial load was less than 12 recipes
  if (initialRecipes.length < 12 && recipes.length === 0) {
    return null
  }

  return (
    <>
      {recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} {...recipe} />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            onClick={loadMore}
            disabled={loading}
            size="lg"
            className="bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Loading...' : 'Load More Recipes'}
          </Button>
        </div>
      )}

      {!hasMore && recipes.length > 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-600">No more recipes to load</p>
        </div>
      )}
    </>
  )
}
