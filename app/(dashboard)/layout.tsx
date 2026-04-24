import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/auth'
import DashboardWrapper from '@/app/components/layout/DashboardWrapper'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <DashboardWrapper user={session}>
      {children}
    </DashboardWrapper>
  )
}
