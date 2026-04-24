import 'dotenv/config'
import { db } from './db'
import { users, categories, tickets } from './schema'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

async function main() {
  console.log('Seeding database...')

  // 1. Seed Users
  const adminPass = await bcrypt.hash('admin123', 10)
  const [admin] = await db.insert(users).values({
    name: 'Administrator',
    email: 'admin@rs.com',
    password: adminPass,
    role: 'ADMIN',
    department: 'Manajemen',
  }).onConflictDoUpdate({
    target: users.email,
    set: { name: 'Administrator', password: adminPass, role: 'ADMIN' }
  }).returning()

  const teknisiPass = await bcrypt.hash('teknisi123', 10)
  const [teknisi] = await db.insert(users).values({
    name: 'Ahmad Teknisi',
    email: 'teknisi@rs.com',
    password: teknisiPass,
    role: 'TEKNISI',
    department: 'Teknik',
  }).onConflictDoUpdate({
    target: users.email,
    set: { name: 'Ahmad Teknisi', password: teknisiPass, role: 'TEKNISI' }
  }).returning()

  const staffPass = await bcrypt.hash('staff123', 10)
  const [staff] = await db.insert(users).values({
    name: 'Budi Staff',
    email: 'staff@rs.com',
    password: staffPass,
    role: 'STAFF',
    department: 'IGD',
  }).onConflictDoUpdate({
    target: users.email,
    set: { name: 'Budi Staff', password: staffPass, role: 'STAFF' }
  }).returning()

  // 2. Seed Categories
  const categoryData = [
    { name: 'IT & Sistem', description: 'Masalah komputer, jaringan, aplikasi' },
    { name: 'Fasilitas', description: 'AC, listrik, plumbing, gedung' },
    { name: 'Alat Medis', description: 'Peralatan dan mesin medis' },
    { name: 'Farmasi', description: 'Permintaan dan masalah obat-obatan' },
    { name: 'Kebersihan', description: 'Kebersihan ruangan dan lingkungan' },
    { name: 'Lainnya', description: 'Permintaan atau laporan lainnya' },
  ]

  for (const cat of categoryData) {
    await db.insert(categories).values(cat).onConflictDoNothing()
  }

  // 3. Get Categories for Tickets
  const [itCategory] = await db.select().from(categories).where(eq(categories.name, 'IT & Sistem'))
  const [fasCategory] = await db.select().from(categories).where(eq(categories.name, 'Fasilitas'))

  if (itCategory && fasCategory && staff && teknisi) {
    // 4. Seed Tickets
    await db.insert(tickets).values([
      {
        title: 'Printer di ruang administrasi tidak bisa digunakan',
        description: 'Printer HP LaserJet di ruang administrasi lantai 2 tidak mau mencetak sejak pagi.',
        priority: 'HIGH',
        status: 'OPEN',
        categoryId: itCategory.id,
        createdById: staff.id,
      },
      {
        title: 'AC di ruang ICU mati',
        description: 'AC di ruang ICU nomor 3 tidak berfungsi sejak kemarin malam.',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        categoryId: fasCategory.id,
        createdById: staff.id,
        assignedToId: teknisi.id,
      }
    ])
  }

  console.log('Seed selesai!')
  console.log('Login: admin@rs.com / admin123')
  console.log('Login: teknisi@rs.com / teknisi123')
  console.log('Login: staff@rs.com / staff123')
}

main().catch(console.error)
