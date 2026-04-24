export type Role = 'STAFF' | 'TEKNISI' | 'ADMIN'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export type SessionUser = {
  id: string
  name: string
  email: string
  role: Role
  department?: string | null
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Rendah',
  MEDIUM: 'Sedang',
  HIGH: 'Tinggi',
  CRITICAL: 'Kritis',
}

export const STATUS_LABELS: Record<Status, string> = {
  OPEN: 'Menunggu',
  IN_PROGRESS: 'Dikerjakan',
  RESOLVED: 'Selesai',
  CLOSED: 'Ditutup',
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
}

export const STATUS_COLORS: Record<Status, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
}
