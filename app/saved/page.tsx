import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import RecipeCard from '@/components/recipes/recipe-card'
import EmptyState from '@/components/recipes/empty-state'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export default async function SavedRecipesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch saved recipes with full recipe details
  const { data: savedRecipes } = await supabase
    .from('saved_recipes')
    .select(`
      created_at,
      recipes (
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
        recipe_images (
          image_url,
          is_primary
        ),
        recipe_categories (
          categories (
            id,
            name,
            slug
          )
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const recipes = savedRecipes?.map((saved: any) => {
    const recipe = saved.recipes
    return {
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
      categories: recipe.recipe_categories?.map((rc: any) => rc.categories).filter(Boolean) || [],
    }
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Saved Recipes' }]} />
        
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Saved Recipes
          </h1>
          <p className="text-xl text-gray-600">
            Your personal cookbook of favorite recipes
          </p>
        </div>

        {recipes.length === 0 ? (
          <EmptyState
            title="No saved recipes yet"
            description="Start saving recipes you love to build your personal cookbook"
            actionLabel="Browse Recipes"
            actionHref="/recipes"
          />
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'} saved
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} {...recipe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
