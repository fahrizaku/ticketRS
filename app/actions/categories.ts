'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/app/lib/db'
import { categories } from '@/app/lib/schema'
import { eq } from 'drizzle-orm'
import { getSession } from '@/app/lib/auth'

const CategorySchema = z.object({
  name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  description: z.string().optional(),
})

export type CategoryState = {
  errors?: { name?: string[]; description?: string[] }
  message?: string
  success?: boolean
} | null

export async function createCategory(state: CategoryState, formData: FormData): Promise<CategoryState> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { message: 'Tidak punya akses' }

  const validated = CategorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const [existing] = await db.select().from(categories).where(eq(categories.name, validated.data.name))
  if (existing) return { message: 'Kategori sudah ada' }

  await db.insert(categories).values({
    name: validated.data.name,
    description: validated.data.description,
  })

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(categoryId: string) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') redirect('/dashboard')

  await db.delete(categories).where(eq(categories.id, categoryId))
  revalidatePath('/admin/categories')
}
