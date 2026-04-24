import { db } from '@/app/lib/db'
import { categories as categoriesTable } from '@/app/lib/schema'
import { NewTicketForm } from './NewTicketForm'

export default async function NewTicketPage() {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name)
  return <NewTicketForm categories={categories} />
}
