import Link from 'next/link'
import { PlusCircle, Search, Filter, RotateCcw, Ticket as TicketIcon } from 'lucide-react'
import { getSession } from '@/app/lib/auth'
import { db } from '@/app/lib/db'
import { tickets as ticketsTable, categories as categoriesTable, users } from '@/app/lib/schema'
import { eq, and, desc, sql, like, asc } from 'drizzle-orm'
import { PriorityBadge, StatusBadge } from '@/app/components/ui/Badge'
import AvatarText from '@/app/components/ui/AvatarText'
import ComponentCard from '@/app/components/common/ComponentCard'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/app/components/ui/Table'
import type { Priority, Status } from '@/app/lib/definitions'

type SearchParams = { status?: string; priority?: string; category?: string; q?: string }

export default async function TicketsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await getSession()
  if (!session) return null

  const params = await searchParams
  const { status, priority, category, q } = params

  const filters = []

  // Role based filtering
  if (session.role === 'STAFF') {
    filters.push(eq(ticketsTable.createdById, session.id))
  } else if (session.role === 'TEKNISI') {
    filters.push(eq(ticketsTable.assignedToId, session.id))
  }

  // Search/Filter params
  if (status) filters.push(eq(ticketsTable.status, status))
  if (priority) filters.push(eq(ticketsTable.priority, priority))
  if (category) filters.push(eq(ticketsTable.categoryId, category))
  if (q) filters.push(like(ticketsTable.title, `%${q}%`))

  const finalWhere = filters.length > 0 ? and(...filters) : undefined

  const [ticketsRes, categories] = await Promise.all([
    db.select({
      id: ticketsTable.id,
      title: ticketsTable.title,
      description: ticketsTable.description,
      priority: ticketsTable.priority,
      status: ticketsTable.status,
      createdAt: ticketsTable.createdAt,
      categoryName: categoriesTable.name,
      createdByName: users.name,
      assignedToName: sql<string | null>`(SELECT name FROM users WHERE id = ${ticketsTable.assignedToId})`
    })
      .from(ticketsTable)
      .where(finalWhere)
      .innerJoin(categoriesTable, eq(ticketsTable.categoryId, categoriesTable.id))
      .innerJoin(users, eq(ticketsTable.createdById, users.id))
      .orderBy(desc(ticketsTable.createdAt)),
    db.select().from(categoriesTable)
      .orderBy(sql`CASE WHEN ${categoriesTable.name} = 'Lainnya' THEN 1 ELSE 0 END`, asc(categoriesTable.name))
  ])

  const statuses = [
    { value: '', label: 'Semua Status' },
    { value: 'OPEN', label: 'Menunggu' },
    { value: 'IN_PROGRESS', label: 'Dikerjakan' },
    { value: 'RESOLVED', label: 'Selesai' },
    { value: 'CLOSED', label: 'Ditutup' },
  ]

  const priorities = [
    { value: '', label: 'Semua Prioritas' },
    { value: 'CRITICAL', label: 'Kritis' },
    { value: 'HIGH', label: 'Tinggi' },
    { value: 'MEDIUM', label: 'Sedang' },
    { value: 'LOW', label: 'Rendah' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Daftar Tiket</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {ticketsRes.length} tiket ditemukan dalam sistem
          </p>
        </div>
        {(session.role === 'STAFF' || session.role === 'ADMIN') && (
          <Link
            href="/tickets/new"
            className="inline-flex items-center justify-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-600 shadow-lg shadow-brand-500/20 transition-all active:scale-95"
          >
            <PlusCircle size={18} />
            Buat Tiket Baru
          </Link>
        )}
      </div>

      <ComponentCard title="Filter & Pencarian">
        <form method="GET" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </span>
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari judul tiket..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-brand-500 transition-all"
              />
            </div>
            
            <select
              name="status"
              defaultValue={status}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-brand-500 transition-all"
            >
              {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <select
              name="priority"
              defaultValue={priority}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-brand-500 transition-all"
            >
              {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>

            <select
              name="category"
              defaultValue={category}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none focus:border-brand-500 transition-all"
            >
              <option value="">Semua Kategori</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link 
              href="/tickets" 
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw size={16} />
              Reset
            </Link>
            <button 
              type="submit" 
              className="inline-flex items-center gap-2 bg-gray-800 dark:bg-white/10 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-900 dark:hover:bg-white/20 transition-all"
            >
              <Filter size={16} />
              Terapkan Filter
            </button>
          </div>
        </form>
      </ComponentCard>

      <ComponentCard title="Semua Tiket">
        {ticketsRes.length === 0 ? (
          <div className="text-center py-20 text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl mt-4">
            <TicketIcon size={64} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-medium">Tidak ada tiket ditemukan</p>
            <p className="text-sm mt-1">Coba sesuaikan filter atau cari kata kunci lain</p>
          </div>
        ) : (
          <div className="-mx-4 -my-4 sm:-mx-6 sm:-my-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Informasi Tiket</TableCell>
                  <TableCell isHeader>Kategori</TableCell>
                  <TableCell isHeader>Prioritas</TableCell>
                  <TableCell isHeader>Status</TableCell>
                  <TableCell isHeader className="hidden md:table-cell">Ditugaskan</TableCell>
                  <TableCell isHeader className="text-right">Aksi</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketsRes.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarText name={ticket.createdByName} />
                        <div className="max-w-[200px] sm:max-w-[300px]">
                          <Link 
                            href={`/tickets/${ticket.id}`}
                            className="font-bold text-gray-800 dark:text-white hover:text-brand-500 transition-colors block truncate"
                          >
                            {ticket.title}
                          </Link>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <span>{new Date(ticket.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span>•</span>
                            <span className="truncate">oleh {ticket.createdByName}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 uppercase tracking-tight">
                        {ticket.categoryName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={ticket.priority} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {ticket.assignedToName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-[10px] font-bold">
                            {ticket.assignedToName.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{ticket.assignedToName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Belum ada</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link 
                        href={`/tickets/${ticket.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent px-4 py-2 text-xs font-bold text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all shadow-sm"
                      >
                        Buka
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ComponentCard>
    </div>
  )
}
