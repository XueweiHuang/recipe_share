import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  isLoggedIn?: boolean
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export default function EmptyState({ 
  isLoggedIn = false,
  title,
  description,
  actionLabel,
  actionHref
}: EmptyStateProps) {
  // Use custom values if provided, otherwise use defaults
  const displayTitle = title || "No recipes yet"
  const displayDescription = description || (isLoggedIn
    ? "Be the first to share your favorite recipe with the community!"
    : "Login to start sharing your favorite recipes with the community!")
  const displayActionLabel = actionLabel || (isLoggedIn ? "Create Your First Recipe" : "Login to Get Started")
  const displayActionHref = actionHref || (isLoggedIn ? "/recipes/new" : "/login")

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-orange-100 p-6 mb-6">
        <ChefHat className="h-16 w-16 text-orange-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        {displayTitle}
      </h2>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {displayDescription}
      </p>

      <Link href={displayActionHref}>
        <Button className="bg-orange-600 hover:bg-orange-700">
          {displayActionLabel}
        </Button>
      </Link>
    </div>
  )
}
