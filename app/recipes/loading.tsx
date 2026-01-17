import { RecipeCardSkeleton } from '@/components/recipes/recipe-card-skeleton'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export default function RecipesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Browse Recipes' }]} />
        
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Browse Recipes
          </h1>
          <p className="text-xl text-gray-600">
            Loading delicious recipes...
          </p>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <RecipeCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
