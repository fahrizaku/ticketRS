import { SidebarProvider } from './context/SidebarContext'
import { ThemeProvider } from './context/ThemeContext'
import { Outfit } from 'next/font/google'
import type { Viewport } from 'next'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata = {
  title: 'Ticket RS - Sistem Manajemen Tiket Rumah Sakit',
  description: 'Sistem laporan kerusakan alat dan fasilitas rumah sakit',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${outfit.className} dark:bg-gray-950 transition-colors duration-300`}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
