import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/auth'
import { db } from '@/app/lib/db'
import { users as usersTable } from '@/app/lib/schema'
import { desc } from 'drizzle-orm'
import { RegisterForm } from './RegisterForm'
import { UserList } from './UserList'

import PageBreadcrumb from '@/app/components/common/PageBreadcrumb'

export default async function UsersPage() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/dashboard')

  const users = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    role: usersTable.role,
    department: usersTable.department,
    createdAt: usersTable.createdAt,
  })
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))

  return (
    <div>
      <PageBreadcrumb pageTitle="Kelola User" />

      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Daftar Pengguna Sistem
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
          Terdapat {users.length} user yang terdaftar dalam aplikasi
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UserList users={users} currentUserId={session.id} />
        </div>
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Tambah User Baru</h2>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
