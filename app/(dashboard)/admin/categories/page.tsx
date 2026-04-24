import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/auth'
import { db } from '@/app/lib/db'
import { categories as categoriesTable, tickets } from '@/app/lib/schema'
import { asc, sql, count, eq } from 'drizzle-orm'
import { CategoryForm } from './CategoryForm'
import { CategoryList } from './CategoryList'

import PageBreadcrumb from '@/app/components/common/PageBreadcrumb'

export default async function CategoriesPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/dashboard')

  const categoriesData = await db.select({
    id: categoriesTable.id,
    name: categoriesTable.name,
    description: categoriesTable.description,
    createdAt: categoriesTable.createdAt,
    ticketCount: count(tickets.id)
  })
    .from(categoriesTable)
    .leftJoin(tickets, eq(categoriesTable.id, tickets.categoryId))
    .groupBy(categoriesTable.id)
    .orderBy(asc(categoriesTable.name))

  // Mapping to match expected component structure
  const categories = categoriesData.map(c => ({
    ...c,
    _count: { tickets: Number(c.ticketCount) }
  }))

  return (
    <div>
      <PageBreadcrumb pageTitle="Kategori Tiket" />

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Manajemen Kategori
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          Kelola kategori laporan untuk mempermudah klasifikasi tiket
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryList categories={categories} />
        </div>
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Tambah Kategori</h2>
            <CategoryForm />
          </div>
        </div>
      </div>
    </div>
  )
}
