import { notFound } from 'next/navigation'
import { db } from '@/app/lib/db'
import { tickets as ticketsTable, categories, users, comments } from '@/app/lib/schema'
import { eq, asc } from 'drizzle-orm'
import { getSession } from '@/app/lib/auth'
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge'
import { TicketActions } from './TicketActions'
import { CommentSection } from './CommentSection'
import type { Priority, Status } from '@/app/lib/definitions'
import { Calendar, User, Tag, UserCheck } from 'lucide-react'
import Link from 'next/link'
import PageBreadcrumb from '@/app/components/common/PageBreadcrumb'

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) return null

  // Fetch ticket details with relations
  const ticketData = await db.select({
    ticket: ticketsTable,
    category: categories,
    createdBy: {
      id: users.id,
      name: users.name,
      email: users.email,
      department: users.department,
    }
  })
    .from(ticketsTable)
    .where(eq(ticketsTable.id, id))
    .innerJoin(categories, eq(ticketsTable.categoryId, categories.id))
    .innerJoin(users, eq(ticketsTable.createdById, users.id))
    .get()

  if (!ticketData) notFound()

  // Fetch assignedTo user separately if exists
  let assignedTo = null
  if (ticketData.ticket.assignedToId) {
    assignedTo = await db.select({
      id: users.id,
      name: users.name,
      email: users.email
    })
      .from(users)
      .where(eq(users.id, ticketData.ticket.assignedToId))
      .get()
  }

  // Fetch comments
  const ticketComments = await db.select({
    id: comments.id,
    content: comments.content,
    createdAt: comments.createdAt,
    user: {
      id: users.id,
      name: users.name,
      role: users.role
    }
  })
    .from(comments)
    .where(eq(comments.ticketId, id))
    .innerJoin(users, eq(comments.userId, users.id))
    .orderBy(asc(comments.createdAt))

  // Fetch teknisis if admin
  const teknisis = session.role === 'ADMIN'
    ? await db.select({ id: users.id, name: users.name })
        .from(users)
        .where(eq(users.role, 'TEKNISI'))
    : []

  const ticket = {
    ...ticketData.ticket,
    category: ticketData.category,
    createdBy: ticketData.createdBy,
    assignedTo: assignedTo ?? null,
    comments: ticketComments
  }

  if (session.role === 'STAFF' && ticket.createdById !== session.id) notFound()

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Detail Tiket" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex gap-2 mb-4">
              <PriorityBadge priority={ticket.priority as Priority} />
              <StatusBadge status={ticket.status as Status} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 font-outfit">{ticket.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-wrap mb-4 leading-relaxed">{ticket.description}</p>
            
            {ticket.imageUrl && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Lampiran Foto</p>
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
                  <img 
                    src={ticket.imageUrl} 
                    alt={ticket.title} 
                    className="max-w-full h-auto mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          <CommentSection
            ticketId={ticket.id}
            comments={ticket.comments.map((c) => ({
              id: c.id,
              content: c.content,
              createdAt: c.createdAt,
              user: c.user,
            }))}
            currentUserId={session.id}
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-theme-xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              Informasi Tiket
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                  <Tag size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kategori</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{ticket.category.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dibuat oleh</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{ticket.createdBy.name}</p>
                  {ticket.createdBy.department && (
                    <p className="text-xs text-gray-500 mt-0.5">{ticket.createdBy.department}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                  <UserCheck size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ditugaskan ke</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {ticket.assignedTo?.name ?? <span className="text-gray-400 italic font-normal">Belum ditugaskan</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Waktu Laporan</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {(session.role === 'ADMIN' || session.role === 'TEKNISI') && (
            <TicketActions
              ticketId={ticket.id}
              currentStatus={ticket.status as Status}
              currentAssignedId={ticket.assignedTo?.id ?? null}
              teknisis={teknisis}
              userRole={session.role}
            />
          )}
        </div>
      </div>
    </div>
  )
}
