import { db } from '@/app/lib/db'
import { categories as categoriesTable } from '@/app/lib/schema'
import { sql } from 'drizzle-orm'
import { NewTicketForm } from './NewTicketForm'

export default async function NewTicketPage() {
  const categories = await db.select().from(categoriesTable)
    .orderBy(sql`CASE WHEN ${categoriesTable.name} = 'Lainnya' THEN 1 ELSE 0 END`, categoriesTable.name)
  return <NewTicketForm categories={categories} />
}
