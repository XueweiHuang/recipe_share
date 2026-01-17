import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { RecipeCardSkeleton } from '@/components/recipes/recipe-card-skeleton'

export default function SavedRecipesLoading() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
