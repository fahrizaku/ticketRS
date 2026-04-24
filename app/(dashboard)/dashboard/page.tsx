import { getSession } from '@/app/lib/auth'
import { db } from '@/app/lib/db'
import { tickets as ticketsTable, categories, users } from '@/app/lib/schema'
import { eq, count, and, desc, and as andDrizzle, sql, or } from 'drizzle-orm'
import type { Priority, Status } from '@/app/lib/definitions'
import { Ticket, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import ComponentCard from '@/app/components/common/ComponentCard'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/components/ui/Table'
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge'
import AvatarText from '@/app/components/ui/AvatarText'
import PageBreadcrumb from '@/app/components/common/PageBreadcrumb'

async function getStats(userId: string, role: string) {
  const baseWhere = role === 'STAFF'
    ? eq(ticketsTable.createdById, userId)
    : role === 'TEKNISI'
    ? eq(ticketsTable.assignedToId, userId)
    : undefined

  const [totalRes] = await db.select({ value: count() }).from(ticketsTable).where(baseWhere)
  const [openRes] = await db.select({ value: count() }).from(ticketsTable).where(andDrizzle(baseWhere, eq(ticketsTable.status, 'OPEN')))
  const [inProgressRes] = await db.select({ value: count() }).from(ticketsTable).where(andDrizzle(baseWhere, eq(ticketsTable.status, 'IN_PROGRESS')))
  const [resolvedRes] = await db.select({ value: count() }).from(ticketsTable).where(andDrizzle(baseWhere, eq(ticketsTable.status, 'RESOLVED')))

  return {
    total: totalRes.value,
    open: openRes.value,
    inProgress: inProgressRes.value,
    resolved: resolvedRes.value
  }
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const baseWhere = session.role === 'STAFF'
    ? eq(ticketsTable.createdById, session.id)
    : session.role === 'TEKNISI'
    ? eq(ticketsTable.assignedToId, session.id)
    : undefined

  const stats = await getStats(session.id, session.role)

  const recentTicketsRes = await db.select({
    id: ticketsTable.id,
    title: ticketsTable.title,
    description: ticketsTable.description,
    priority: ticketsTable.priority,
    status: ticketsTable.status,
    createdAt: ticketsTable.createdAt,
    categoryName: categories.name,
    createdByName: users.name,
    assignedToName: sql<string | null>`(SELECT name FROM users WHERE id = ${ticketsTable.assignedToId})`
  })
    .from(ticketsTable)
    .where(baseWhere)
    .innerJoin(categories, eq(ticketsTable.categoryId, categories.id))
    .innerJoin(users, eq(ticketsTable.createdById, users.id))
    .orderBy(desc(ticketsTable.createdAt))
    .limit(5)

  const recentTickets = recentTicketsRes.map(t => ({
    ...t,
    category: { name: t.categoryName },
    createdBy: { name: t.createdByName },
    assignedTo: t.assignedToName ? { name: t.assignedToName } : null
  }))

  const priorityQueueRes = (session.role === 'ADMIN' || session.role === 'TEKNISI') 
    ? await db.select({
        id: ticketsTable.id,
        title: ticketsTable.title,
        priority: ticketsTable.priority,
        createdAt: ticketsTable.createdAt,
        categoryName: categories.name,
      })
        .from(ticketsTable)
        .where(andDrizzle(
          eq(ticketsTable.status, 'OPEN'),
          or(eq(ticketsTable.priority, 'HIGH'), eq(ticketsTable.priority, 'CRITICAL'))
        ))
        .innerJoin(categories, eq(ticketsTable.categoryId, categories.id))
        .orderBy(desc(ticketsTable.createdAt))
        .limit(3)
    : []

  const statCards = [
    { label: 'Total Tiket', value: stats.total, icon: <Ticket size={24} />, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-500/10' },
    { label: 'Menunggu', value: stats.open, icon: <AlertTriangle size={24} />, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
    { label: 'Dikerjakan', value: stats.inProgress, icon: <Clock size={24} />, color: 'text-blue-light-500', bg: 'bg-blue-light-50 dark:bg-blue-light-500/10' },
    { label: 'Selesai', value: stats.resolved, icon: <CheckCircle size={24} />, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10' },
  ]

  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />
      
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Selamat datang kembali, {session.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          {session.role === 'ADMIN' ? 'Pantau seluruh aktivitas tiket hari ini' : 'Pantau perkembangan tugas perbaikan Anda'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-6 shadow-theme-xs transition-all hover:shadow-theme-md">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {card.label}
              </span>
              <h4 className="mt-1 text-2xl font-bold text-gray-800 dark:text-white">
                {card.value}
              </h4>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <ComponentCard title="Tiket Terbaru" desc="Daftar laporan kerusakan terbaru yang memerlukan perhatian">
          {recentTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Ticket size={48} className="mx-auto mb-3 opacity-20" />
              <p>Belum ada data tiket</p>
            </div>
          ) : (
            <div className="-mx-4 -my-4 sm:-mx-6 sm:-my-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Informasi Tiket</TableCell>
                    <TableCell isHeader>Kategori</TableCell>
                    <TableCell isHeader>Status</TableCell>
                    <TableCell isHeader className="hidden md:table-cell">Prioritas</TableCell>
                    <TableCell isHeader className="hidden lg:table-cell">Tanggal</TableCell>
                    <TableCell isHeader className="text-right">Aksi</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <AvatarText name={ticket.createdBy.name} />
                          <div>
                            <Link 
                              href={`/tickets/${ticket.id}`}
                              className="font-semibold text-gray-800 dark:text-white hover:text-brand-500 transition-colors line-clamp-1"
                            >
                              {ticket.title}
                            </Link>
                            <p className="text-xs text-gray-500 mt-0.5">
                              oleh {ticket.createdBy.name}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                          {ticket.category.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={ticket.status} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <PriorityBadge priority={ticket.priority} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link 
                          href={`/tickets/${ticket.id}`}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          Lihat
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-transparent">
                <Link href="/tickets" className="text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors flex items-center gap-1.5">
                  Lihat Semua Tiket <span>&rarr;</span>
                </Link>
              </div>
            </div>
          )}
        </ComponentCard>

        {(session.role === 'ADMIN' || session.role === 'TEKNISI') && priorityQueueRes.length > 0 && (
          <ComponentCard 
            title="Antrian Mendesak" 
            desc="Tiket prioritas tinggi yang belum dikerjakan"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {priorityQueueRes.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/tickets/${item.id}`}
                  className="p-4 rounded-xl border border-error-100 dark:border-error-500/20 bg-error-50/30 dark:bg-error-500/5 hover:border-error-200 dark:hover:border-error-500/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-error-100 dark:bg-error-500/20 text-error-600 dark:text-error-400 uppercase">
                      {item.priority}
                    </span>
                    <p className="text-[10px] text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-error-600 transition-colors line-clamp-2 mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">{item.categoryName}</p>
                </Link>
              ))}
            </div>
          </ComponentCard>
        )}
      </div>
    </div>
  )
}
