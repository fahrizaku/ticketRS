'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { db } from '@/app/lib/db'
import { users } from '@/app/lib/schema'
import { eq } from 'drizzle-orm'
import { createSession, deleteSession } from '@/app/lib/auth'
import type { Role } from '@/app/lib/definitions'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(1, { message: 'Password wajib diisi' }),
})

export type AuthState = {
  errors?: { email?: string[]; password?: string[] }
  message?: string
} | null

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const [user] = await db.select().from(users).where(eq(users.email, validated.data.email))
  if (!user) return { message: 'Email atau password salah' }

  const passwordMatch = await bcrypt.compare(validated.data.password, user.password)
  if (!passwordMatch) return { message: 'Email atau password salah' }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    department: user.department ?? undefined,
  })

  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  role: z.enum(['STAFF', 'TEKNISI', 'ADMIN']),
  department: z.string().optional(),
})

export type RegisterState = {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    role?: string[]
    department?: string[]
  }
  message?: string
  success?: boolean
} | null

export async function registerUser(state: RegisterState, formData: FormData): Promise<RegisterState> {
  const validated = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
    department: formData.get('department') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const [existing] = await db.select().from(users).where(eq(users.email, validated.data.email))
  if (existing) return { message: 'Email sudah terdaftar' }

  const hashed = await bcrypt.hash(validated.data.password, 10)
  await db.insert(users).values({
    name: validated.data.name,
    email: validated.data.email,
    password: hashed,
    role: validated.data.role,
    department: validated.data.department,
  })

  return { success: true }
}
