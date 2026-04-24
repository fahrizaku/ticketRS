'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/app/lib/db'
import { tickets, comments, users } from '@/app/lib/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/app/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createNotification } from './notifications'

const TicketSchema = z.object({
  title: z.string().min(5, { message: 'Judul minimal 5 karakter' }),
  description: z.string().optional(),
  categoryId: z.string().min(1, { message: 'Pilih kategori' }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
})

export type TicketState = {
  errors?: {
    title?: string[]
    description?: string[]
    categoryId?: string[]
    priority?: string[]
  }
  message?: string
} | null

export async function createTicket(state: TicketState, formData: FormData): Promise<TicketState> {
  const session = await getSession()
  if (!session) redirect('/login')

  const validated = TicketSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    priority: formData.get('priority'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const image = formData.get('image') as File
  let imageUrl: string | undefined = undefined

  if (image && image.size > 0) {
    try {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = join(process.cwd(), 'public/uploads')
      await mkdir(uploadDir, { recursive: true })

      const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`
      const path = join(uploadDir, fileName)
      await writeFile(path, buffer)
      imageUrl = `/uploads/${fileName}`
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const [ticket] = await db.insert(tickets).values({
    title: validated.data.title,
    description: validated.data.description || null,
    categoryId: validated.data.categoryId,
    priority: validated.data.priority,
    imageUrl,
    createdById: session.id,
  }).returning()

  // Notify all admins about new ticket
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, 'ADMIN'))
  await Promise.all(
    admins
      .filter((a) => a.id !== session.id)
      .map((a) => createNotification(a.id, `Tiket baru: "${validated.data.title}"`, `/tickets/${ticket.id}`))
  )

  revalidatePath('/tickets')
  redirect('/tickets')
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'STAFF') return { error: 'Tidak punya akses' }

  const ticket = await db.select().from(tickets).where(eq(tickets.id, ticketId)).get()
  if (!ticket) return { error: 'Tiket tidak ditemukan' }

  await db.update(tickets)
    .set({ status, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId))

  // Notify ticket creator about status change
  if (ticket.createdById !== session.id) {
    const statusLabel: Record<string, string> = { OPEN: 'Menunggu', IN_PROGRESS: 'Sedang Diproses', CLOSED: 'Ditutup' }
    await createNotification(
      ticket.createdById,
      `Status tiket Anda diubah menjadi "${statusLabel[status] ?? status}"`,
      `/tickets/${ticketId}`
    )
  }

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath('/tickets')
  revalidatePath('/dashboard')
}

export async function assignTicket(ticketId: string, assignedToId: string | null) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Tidak punya akses' }

  const ticket = await db.select().from(tickets).where(eq(tickets.id, ticketId)).get()
  if (!ticket) return { error: 'Tiket tidak ditemukan' }

  await db.update(tickets)
    .set({ assignedToId, updatedAt: new Date() })
    .where(eq(tickets.id, ticketId))

  // Notify assigned teknisi
  if (assignedToId && assignedToId !== session.id) {
    await createNotification(
      assignedToId,
      `Anda ditugaskan untuk menangani tiket: "${ticket.title}"`,
      `/tickets/${ticketId}`
    )
  }

  revalidatePath(`/tickets/${ticketId}`)
  revalidatePath('/tickets')
}

export async function addComment(ticketId: string, content: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  if (!content.trim()) return { error: 'Komentar tidak boleh kosong' }

  await db.insert(comments).values({
    content: content.trim(),
    ticketId,
    userId: session.id,
  })

  // Notify ticket creator and assigned teknisi (excluding commenter)
  const ticket = await db.select().from(tickets).where(eq(tickets.id, ticketId)).get()
  if (ticket) {
    const recipients = new Set([ticket.createdById, ticket.assignedToId].filter(Boolean) as string[])
    recipients.delete(session.id)
    await Promise.all(
      [...recipients].map((uid) =>
        createNotification(uid, `Komentar baru pada tiket: "${ticket.title}"`, `/tickets/${ticketId}`)
      )
    )
  }

  revalidatePath(`/tickets/${ticketId}`)
}

export async function deleteTicket(ticketId: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Tidak punya akses' }

  await db.delete(tickets).where(eq(tickets.id, ticketId))

  revalidatePath('/tickets')
  revalidatePath('/dashboard')
  redirect('/tickets')
}
