import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionUser } from './definitions'

const COOKIE_NAME = 'session'

// The signing key must come from the environment: there is deliberately no
// fallback, so a missing secret fails loudly instead of silently signing
// sessions with a publicly known value. Read lazily so `next build` works
// without secrets being present.
function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET is not set or shorter than 32 characters')
  }
  return new TextEncoder().encode(secret)
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const secret = getSecret() // outside try: a misconfiguration must not look like "logged out"
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.user as SessionUser
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}
