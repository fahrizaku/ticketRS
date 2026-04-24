'use client'

import { useState, useTransition } from 'react'
import { Loader2, ChevronDown } from 'lucide-react'
import { updateTicketStatus, assignTicket } from '@/app/actions/tickets'
import type { Status } from '@/app/lib/definitions'
import { STATUS_LABELS } from '@/app/lib/definitions'

type Teknisi = { id: string; name: string }

type Props = {
  ticketId: string
  currentStatus: Status
  currentAssignedId: string | null
  teknisis: Teknisi[]
  userRole: string
}

const NEXT_STATUSES: Record<Status, Status[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
}

export function TicketActions({ ticketId, currentStatus, currentAssignedId, teknisis, userRole }: Props) {
  const [isPending, startTransition] = useTransition()
  const [assignedId, setAssignedId] = useState(currentAssignedId ?? '')

  const nextStatuses = NEXT_STATUSES[currentStatus]

  function handleStatusChange(status: string) {
    startTransition(async () => {
      await updateTicketStatus(ticketId, status)
    })
  }

  function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setAssignedId(val)
    startTransition(async () => {
      await assignTicket(ticketId, val || null)
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Aksi</h3>

      {userRole === 'ADMIN' && teknisis.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tugaskan ke Teknisi</label>
          <select
            value={assignedId}
            onChange={handleAssign}
            disabled={isPending}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            <option value="">Belum ditugaskan</option>
            {teknisis.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {nextStatuses.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Ubah Status</label>
          <div className="flex flex-col gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isPending && <Loader2 size={14} className="animate-spin" />}
                → {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      )}

      {isPending && (
        <p className="text-xs text-gray-500 text-center">Memperbarui...</p>
      )}
    </div>
  )
}
