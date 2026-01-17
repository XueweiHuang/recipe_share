import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Users, ChefHat, Edit, Trash2 } from 'lucide-react'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import Link from 'next/link'
import DeleteRecipeButton from '@/components/recipes/delete-recipe-button'
import LikeButton from '@/components/recipes/like-button'
import SaveButton from '@/components/recipes/save-button'

export async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch recipe with related data
  const { data: recipe, error } = await supabase
    .from('recipes')
    .select(`
      *,
      profiles:user_id (username, full_name),
      ingredients (id, name, quantity, unit, order),
      instructions (id, step_number, description),
      recipe_categories (
        categories (
          id,
          name,
          slug
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !recipe) {
    notFound()
  }

  // Check if current user is the recipe owner
  const isOwner = user?.id === recipe.user_id

  // Get like count and check if user has liked
  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('recipe_id', id)

  let isLiked = false
  let isSaved = false
  if (user) {
    const { data: userLike } = await supabase
      .from('likes')
      .select('id')
      .eq('recipe_id', id)
      .eq('user_id', user.id)
      .single()
    isLiked = !!userLike

    const { data: userSaved } = await supabase
      .from('saved_recipes')
      .select('id')
      .eq('recipe_id', id)
      .eq('user_id', user.id)
      .single()
    isSaved = !!userSaved
  }

  // Sort ingredients and instructions
  const sortedIngredients = recipe.ingredients.sort((a: any, b: any) => a.order - b.order)
  const sortedInstructions = recipe.instructions.sort((a: any, b: any) => a.step_number - b.step_number)
  
  // Extract categories
  const categories = recipe.recipe_categories?.map((rc: any) => rc.categories).filter(Boolean) || []

  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumbs 
          items={[
            { label: 'Browse Recipes', href: '/recipes' },
            { label: recipe.title }
          ]} 
        />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>By {recipe.profiles?.full_name || recipe.profiles?.username}</span>
            </div>
            {isOwner && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/recipes/${id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <DeleteRecipeButton recipeId={id} recipeTitle={recipe.title} />
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{recipe.title}</h1>
          {recipe.description && (
            <p className="text-xl text-gray-600">{recipe.description}</p>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {categories.map((category: any) => (
                <Badge key={category.id} variant="outline" className="text-sm">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Meta information */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="h-5 w-5 text-orange-600" />
              <span className="font-medium">Total: {totalTime} min</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Users className="h-5 w-5 text-orange-600" />
              <span className="font-medium">{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <ChefHat className="h-5 w-5 text-orange-600" />
              <Badge variant="secondary" className="capitalize">{recipe.difficulty}</Badge>
            </div>
          </div>

          {/* Social Actions */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t">
            <LikeButton
              recipeId={id}
              initialLikeCount={likeCount || 0}
              initialIsLiked={isLiked}
              isLoggedIn={!!user}
            />
            <SaveButton
              recipeId={id}
              initialIsSaved={isSaved}
              isLoggedIn={!!user}
            />
          </div>
        </div>

        {/* Ingredients */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {sortedIngredients.map((ingredient: any) => (
                <li key={ingredient.id} className="flex items-start">
                  <span className="text-orange-600 mr-2">•</span>
                  <span>
                    {ingredient.quantity && <strong>{ingredient.quantity} </strong>}
                    {ingredient.unit && <span>{ingredient.unit} </span>}
                    {ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {sortedInstructions.map((instruction: any) => (
                <li key={instruction.id} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold">
                    {instruction.step_number}
                  </div>
                  <p className="text-gray-700 flex-1 pt-1">{instruction.description}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RecipeDetailPage
