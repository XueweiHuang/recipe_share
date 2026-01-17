'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  recipeId: string
  isLoggedIn: boolean
  onCommentAdded: () => void
}

export function CommentForm({ recipeId, isLoggedIn, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    if (!content.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          content: content.trim(),
        })

      if (insertError) throw insertError

      setContent('')
      onCommentAdded()
    } catch (err: any) {
      setError(err.message || 'Failed to post comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}
      
      <Textarea
        placeholder={isLoggedIn ? "Share your thoughts about this recipe..." : "Login to comment"}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={!isLoggedIn || loading}
        maxLength={1000}
        rows={3}
        className="resize-none"
      />
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {content.length}/1000 characters
        </span>
        <Button
          type="submit"
          disabled={!content.trim() || loading || !isLoggedIn}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>
    </form>
  )
}
