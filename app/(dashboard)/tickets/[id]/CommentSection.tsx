'use client'

import { useState, useTransition } from 'react'
import { Loader2, MessageSquare, Send } from 'lucide-react'
import { addComment } from '@/app/actions/tickets'

type Comment = {
  id: string
  content: string
  createdAt: Date
  user: { id: string; name: string; role: string }
}

type Props = {
  ticketId: string
  comments: Comment[]
  currentUserId: string
}

const ROLE_LABELS: Record<string, string> = { STAFF: 'Staff', TEKNISI: 'Teknisi', ADMIN: 'Admin' }
const ROLE_COLORS: Record<string, string> = {
  STAFF: 'bg-gray-100 text-gray-600',
  TEKNISI: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
}

export function CommentSection({ ticketId, comments: initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError('')

    startTransition(async () => {
      const result = await addComment(ticketId, content)
      if (result?.error) {
        setError(result.error)
      } else {
        setContent('')
      }
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare size={16} />
        Komentar ({comments.length})
      </h3>

      {comments.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-4">Belum ada komentar</p>
      ) : (
        <div className="space-y-4 mb-6">
          {comments.map((comment) => (
            <div key={comment.id} className={`flex gap-3 ${comment.user.id === currentUserId ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className={`flex-1 ${comment.user.id === currentUserId ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-700">{comment.user.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${ROLE_COLORS[comment.user.role]}`}>
                    {ROLE_LABELS[comment.user.role]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[85%] ${
                  comment.user.id === currentUserId
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {comment.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis komentar..."
          disabled={isPending}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
