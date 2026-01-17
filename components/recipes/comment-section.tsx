'use client'

import { useState, useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import { CommentForm } from './comment-form'
import { CommentItem } from './comment-item'
import { createClient } from '@/lib/supabase/client'

interface CommentSectionProps {
  recipeId: string
  initialComments: any[]
  currentUserId: string | null
  isLoggedIn: boolean
}

export function CommentSection({
  recipeId,
  initialComments,
  currentUserId,
  isLoggedIn,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchComments = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-orange-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <CommentForm
        recipeId={recipeId}
        isLoggedIn={isLoggedIn}
        onCommentAdded={fetchComments}
      />

      {/* Comments List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onCommentUpdated={fetchComments}
            />
          ))
        )}
      </div>
    </div>
  )
}
