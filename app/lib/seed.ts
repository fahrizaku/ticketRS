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
    username: 'admin',
    email: 'admin@rs.com',
    password: adminPass,
    role: 'ADMIN',
    department: 'Manajemen',
  }).onConflictDoUpdate({
    target: users.email,
    set: { name: 'Administrator', username: 'admin', password: adminPass, role: 'ADMIN' }
  }).returning()

  const teknisiPass = await bcrypt.hash('teknisi123', 10)
  const [teknisi] = await db.insert(users).values({
    name: 'Ahmad Teknisi',
    username: 'teknisi',
    email: 'teknisi@rs.com',
    password: teknisiPass,
    role: 'TEKNISI',
    department: 'Teknik',
  }).onConflictDoUpdate({
    target: users.email,
    set: { name: 'Ahmad Teknisi', username: 'teknisi', password: teknisiPass, role: 'TEKNISI' }
  }).returning()

  const staffPass = await bcrypt.hash('staff123', 10)
  const [staff] = await db.insert(users).values({
    name: 'Budi Staff',
    username: 'staff',
    email: 'staff@rs.com',
    password: staffPass,
    role: 'STAFF',
    department: 'IGD',
  }).onConflictDoUpdate({
    target: users.email,
    set: { name: 'Budi Staff', username: 'staff', password: staffPass, role: 'STAFF' }
  }).returning()

  // 2. Seed Categories
  const categoryData = [
    { name: 'Jaringan Internet', description: 'Masalah koneksi internet, WiFi, LAN' },
    { name: 'Aplikasi SIMRS', description: 'Bug, error, atau gangguan pada aplikasi SIMRS' },
    { name: 'Komputer/Hardware', description: 'Kerusakan komputer, printer, dan perangkat keras lainnya' },
    { name: 'Listrik', description: 'Gangguan daya listrik, stop kontak, atau instalasi' },
    { name: 'Lainnya', description: 'Laporan atau permintaan di luar kategori di atas' },
  ]

  for (const cat of categoryData) {
    await db.insert(categories).values(cat).onConflictDoNothing()
  }

  // 3. Get Categories for Tickets
  const [jaringanCategory] = await db.select().from(categories).where(eq(categories.name, 'Jaringan Internet'))
  const [hardwareCategory] = await db.select().from(categories).where(eq(categories.name, 'Komputer/Hardware'))

  if (jaringanCategory && hardwareCategory && staff && teknisi) {
    // 4. Seed Tickets
    await db.insert(tickets).values([
      {
        title: 'Printer di ruang administrasi tidak bisa digunakan',
        description: 'Printer HP LaserJet di ruang administrasi lantai 2 tidak mau mencetak sejak pagi.',
        priority: 'HIGH',
        status: 'OPEN',
        categoryId: hardwareCategory.id,
        createdById: staff.id,
      },
      {
        title: 'Internet di poli rawat jalan sangat lambat',
        description: 'Koneksi internet di area poli rawat jalan tidak stabil sejak kemarin, menghambat akses SIMRS.',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        categoryId: jaringanCategory.id,
        createdById: staff.id,
        assignedToId: teknisi.id,
      }
    ])
  }

  console.log('Seed selesai!')
  console.log('Login: admin / admin123')
  console.log('Login: teknisi / teknisi123')
  console.log('Login: staff / staff123')
}

main().catch(console.error)
