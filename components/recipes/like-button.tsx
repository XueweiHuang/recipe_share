'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  recipeId: string
  initialLikeCount: number
  initialIsLiked: boolean
  isLoggedIn: boolean
}

export default function LikeButton({
  recipeId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLike = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setLoading(true)

    // Optimistic UI update
    const newIsLiked = !isLiked
    const newCount = newIsLiked ? likeCount + 1 : likeCount - 1
    setIsLiked(newIsLiked)
    setLikeCount(newCount)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (newIsLiked) {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, recipe_id: recipeId })

        if (error) throw error
      } else {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)

        if (error) throw error
      }
    } catch (error) {
      // Revert on error
      console.error('Error toggling like:', error)
      setIsLiked(!newIsLiked)
      setLikeCount(likeCount)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isLiked ? 'default' : 'outline'}
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className={isLiked ? 'bg-red-600 hover:bg-red-700' : ''}
    >
      <Heart
        className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`}
      />
      {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
    </Button>
  )
}
