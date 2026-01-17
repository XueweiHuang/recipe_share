'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bookmark, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface SaveButtonProps {
  recipeId: string
  initialIsSaved: boolean
  isLoggedIn: boolean
}

export default function SaveButton({
  recipeId,
  initialIsSaved,
  isLoggedIn,
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSave = async () => {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setLoading(true)

    // Optimistic UI update
    const newIsSaved = !isSaved
    setIsSaved(newIsSaved)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      if (newIsSaved) {
        // Add to saved recipes
        const { error } = await supabase
          .from('saved_recipes')
          .insert({ user_id: user.id, recipe_id: recipeId })

        if (error) throw error
      } else {
        // Remove from saved recipes
        const { error } = await supabase
          .from('saved_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId)

        if (error) throw error
      }
    } catch (error) {
      // Revert on error
      console.error('Error toggling save:', error)
      setIsSaved(!newIsSaved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={isSaved ? 'default' : 'outline'}
      size="sm"
      onClick={handleSave}
      disabled={loading}
      className={isSaved ? 'bg-orange-600 hover:bg-orange-700' : ''}
    >
      {isSaved ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" />
          Save
        </>
      )}
    </Button>
  )
}
