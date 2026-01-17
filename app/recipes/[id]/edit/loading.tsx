import { RecipeCardSkeleton } from '@/components/recipes/recipe-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'

export default function EditRecipeLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Breadcrumbs 
          items={[
            { label: 'Browse Recipes', href: '/recipes' },
            { label: 'Loading...' },
            { label: 'Edit' }
          ]} 
        />
        
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-8">
          {/* Basic Information Card */}
          <div className="border rounded-lg p-6 bg-white">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>

          {/* Ingredients Card */}
          <div className="border rounded-lg p-6 bg-white">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>

          {/* Instructions Card */}
          <div className="border rounded-lg p-6 bg-white">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 justify-end">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
