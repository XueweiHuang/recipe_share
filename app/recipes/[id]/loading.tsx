import { RecipeCardSkeleton } from '@/components/recipes/recipe-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export default function RecipeDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumbs 
          items={[
            { label: 'Browse Recipes', href: '/recipes' },
            { label: 'Loading...' }
          ]} 
        />
        
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-3/4 mb-4" /> {/* Title */}
          <Skeleton className="h-6 w-full" /> {/* Description */}

          {/* Meta information */}
          <div className="flex flex-wrap gap-4 mt-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        {/* Ingredients Card Skeleton */}
        <div className="border rounded-lg p-6 mb-8 bg-white">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>

        {/* Instructions Card Skeleton */}
        <div className="border rounded-lg p-6 bg-white">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <Skeleton className="h-16 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
