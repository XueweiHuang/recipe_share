import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, ChefHat } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface RecipeCardProps {
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
  categories?: Array<{
    id: string
    name: string
    slug: string
  }>
}

export default function RecipeCard({
  id,
  title,
  description,
  cookTime,
  servings,
  difficulty,
  primaryImage,
  author,
  categories = [],
}: RecipeCardProps) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  }

  return (
    <Link href={`/recipes/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative h-48 w-full bg-gray-200">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <ChefHat className="h-16 w-16" />
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{title}</h3>
          
          {description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {description}
            </p>
          )}

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {categories.slice(0, 3).map(category => (
                <Badge key={category.id} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
              {categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{categories.length - 3}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            {cookTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{cookTime}min</span>
              </div>
            )}
            {servings && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{servings} servings</span>
              </div>
            )}
            {difficulty && (
              <Badge className={difficultyColors[difficulty]} variant="secondary">
                {difficulty}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t">
            <Avatar className="h-6 w-6">
              <AvatarImage src={author.avatarUrl || ''} />
              <AvatarFallback>
                {author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">by @{author.username}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
