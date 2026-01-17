import { createClient } from '@/lib/supabase/server'
import RecipeSearch from '@/components/recipes/recipe-search'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export default async function RecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch initial 12 recipes
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
    .limit(12)

  const recipes = data?.map((recipe: any) => ({
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
  })) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Browse Recipes' }]} />
        
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Browse Recipes
          </h1>
          <p className="text-xl text-gray-600">
            Discover delicious recipes from our community of home cooks
          </p>
        </div>

        <RecipeSearch initialRecipes={recipes} isLoggedIn={!!user} />
      </div>
    </div>
  )
}
