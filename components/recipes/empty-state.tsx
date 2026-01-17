import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  isLoggedIn?: boolean
}

export default function EmptyState({ isLoggedIn = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="rounded-full bg-orange-100 p-6 mb-6">
        <ChefHat className="h-16 w-16 text-orange-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        No recipes yet
      </h2>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {isLoggedIn
          ? "Be the first to share your favorite recipe with the community!"
          : "Login to start sharing your favorite recipes with the community!"}
      </p>

      {isLoggedIn ? (
        <Link href="/recipes/new">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Create Your First Recipe
          </Button>
        </Link>
      ) : (
        <Link href="/login">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Login to Get Started
          </Button>
        </Link>
      )}
    </div>
  )
}
