'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Loader2, Upload, AlertCircle } from 'lucide-react'
import { createTicket } from '@/app/actions/tickets'
import ComponentCard from '@/app/components/common/ComponentCard'
import PageBreadcrumb from '@/app/components/common/PageBreadcrumb'

type Category = { id: string; name: string }

export function NewTicketForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createTicket, null)

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Buat Tiket Baru" />

      <ComponentCard title="Informasi Laporan" desc="Isi detail laporan dengan lengkap untuk memudahkan tim teknis">
        <form action={action} className="space-y-6">
          <div className="space-y-4">
            {/* Judul Tiket */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Judul Laporan <span className="text-error-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                required
                placeholder="Contoh: Lampu Ruang Perawatan Lantai 3 Mati"
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-white/5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 ${state?.errors?.title ? 'border-error-500' : 'border-gray-200 dark:border-gray-800'}`}
              />
              {state?.errors?.title && (
                <p className="text-error-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {state.errors.title[0]}
                </p>
              )}
            </div>

            {/* Deskripsi */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Detail Deskripsi <span className="text-error-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                placeholder="Jelaskan secara detail lokasi kejadian, jenis kerusakan, dan kronologinya..."
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-white/5 text-sm outline-none transition-all focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 resize-none ${state?.errors?.description ? 'border-error-500' : 'border-gray-200 dark:border-gray-800'}`}
              />
              {state?.errors?.description && (
                <p className="text-error-500 text-xs mt-1.5 flex items-center gap-1">
                  <AlertCircle size={12} /> {state.errors.description[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Kategori */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Kategori <span className="text-error-500">*</span>
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none transition-all focus:border-brand-500"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {state?.errors?.categoryId && (
                  <p className="text-error-500 text-xs mt-1.5 flex items-center gap-1">
                    <AlertCircle size={12} /> {state.errors.categoryId[0]}
                  </p>
                )}
              </div>

              {/* Prioritas */}
              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Tingkat Prioritas <span className="text-error-500">*</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue="MEDIUM"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-white/5 text-sm outline-none transition-all focus:border-brand-500"
                >
                  <option value="LOW">Rendah (Normal)</option>
                  <option value="MEDIUM">Sedang (Butuh Perhatian)</option>
                  <option value="HIGH">Tinggi (Segera)</option>
                  <option value="CRITICAL">Kritis (Emergency)</option>
                </select>
              </div>
            </div>

            {/* Upload Gambar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Foto Bukti (Opsional)
              </label>
              <div className="relative group">
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const fileName = e.target.files?.[0]?.name;
                    if (fileName) {
                      const display = document.getElementById('file-name-display');
                      if (display) display.innerText = fileName;
                    }
                  }}
                />
                <label 
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-white/5 cursor-pointer group-hover:border-brand-500/50 group-hover:bg-brand-500/5 transition-all"
                >
                  <div className="bg-brand-500/10 text-brand-500 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300" id="file-name-display">Klik untuk pilih foto atau tarik ke sini</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG atau WebP (Maks. 5MB)</p>
                </label>
              </div>
            </div>
          </div>

          {state?.message && (
            <div className="rounded-xl bg-error-50 dark:bg-error-500/10 p-4 flex gap-3 items-center">
              <AlertCircle className="text-error-500 shrink-0" size={20} />
              <p className="text-sm font-medium text-error-600 dark:text-error-400">
                {state.message}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={pending}
              className="flex-1 flex items-center justify-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-brand-600 shadow-lg shadow-brand-500/20 disabled:opacity-70 transition-all active:scale-95"
            >
              {pending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Mengirim Laporan...
                </>
              ) : (
                "Kirim Tiket Sekarang"
              )}
            </button>
            <Link 
              href="/tickets" 
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              Batal
            </Link>
          </div>
        </form>
      </ComponentCard>
    </div>
  )
}
