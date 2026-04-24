import Link from 'next/link'
import { Clock, User, Tag } from 'lucide-react'
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge'
import type { Priority, Status } from '@/app/lib/definitions'

type TicketCardProps = {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  category: string
  createdBy: string
  assignedTo?: string | null
  createdAt: Date
}

export function TicketCard({ id, title, description, priority, status, category, createdBy, assignedTo, createdAt }: TicketCardProps) {
  return (
    <Link href={`/tickets/${id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{title}</h3>
          <div className="flex gap-1.5 shrink-0">
            <PriorityBadge priority={priority} />
            <StatusBadge status={status} />
          </div>
        </div>

        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{description}</p>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Tag size={12} />
            {category}
          </span>
          <span className="flex items-center gap-1">
            <User size={12} />
            {createdBy}
          </span>
          {assignedTo && (
            <span className="flex items-center gap-1 text-blue-500">
              → {assignedTo}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={12} />
            {new Date(createdAt).toLocaleDateString('id-ID')}
          </span>
        </div>
      </div>
    </Link>
  )
}
