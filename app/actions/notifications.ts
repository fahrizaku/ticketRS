'use server'

import { db } from '@/app/lib/db'
import { notifications } from '@/app/lib/schema'
import { eq, desc, and } from 'drizzle-orm'
import { getSession } from '@/app/lib/auth'
import { eventBus, EVENTS } from '@/app/lib/events'

export async function createNotification(userId: string, message: string, link?: string) {
  const [newNotification] = await db
    .insert(notifications)
    .values({ userId, message, link })
    .returning()

  // Emit event ke pusat event bus
  eventBus.emit(EVENTS.NOTIFICATION_NEW, {
    userId,
    notification: newNotification,
  })

  return newNotification
}

export async function getNotifications() {
  const session = await getSession()
  if (!session) return []

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.id))
    .orderBy(desc(notifications.createdAt))
    .limit(20)
}

export async function markAllAsRead() {
  const session = await getSession()
  if (!session) return

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, session.id), eq(notifications.isRead, false)))
}

export async function markAsRead(id: string) {
  const session = await getSession()
  if (!session) return

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, session.id)))
}
