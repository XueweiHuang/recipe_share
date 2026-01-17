'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit2, Trash2, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'

interface CommentItemProps {
  comment: {
    id: string
    content: string
    created_at: string
    updated_at: string
    user_id: string
    profiles: {
      username: string
      avatar_url: string | null
    }
  }
  currentUserId: string | null
  onCommentUpdated: () => void
}

export function CommentItem({ comment, currentUserId, onCommentUpdated }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const isOwner = currentUserId === comment.user_id

  const handleEdit = async () => {
    if (!editContent.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', comment.id)

      if (error) throw error

      setIsEditing(false)
      onCommentUpdated()
    } catch (error) {
      console.error('Error updating comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', comment.id)

      if (error) throw error

      onCommentUpdated()
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-3 p-4 bg-white rounded-lg border">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
        <AvatarFallback className="bg-orange-100 text-orange-600">
          {comment.profiles?.username?.substring(0, 2).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">@{comment.profiles?.username || 'Unknown'}</span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
          {comment.updated_at !== comment.created_at && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={1000}
              rows={3}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={loading || !editContent.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(comment.content)
                }}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-700 text-sm whitespace-pre-wrap break-words">
              {comment.content}
            </p>

            {isOwner && (
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                  className="h-7 text-xs"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={loading}
                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
