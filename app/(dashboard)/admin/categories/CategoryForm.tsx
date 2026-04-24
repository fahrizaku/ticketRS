'use client'

import { useActionState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { createCategory } from '@/app/actions/categories'

export function CategoryForm() {
  const [state, action, pending] = useActionState(createCategory, null)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Nama Kategori</label>
        <input
          name="name"
          placeholder="Contoh: IT, Fasilitas, Alat Medis"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Keterangan singkat kategori ini"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {state?.message && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-red-600 text-xs">{state.message}</p>
        </div>
      )}

      {state?.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
          <CheckCircle size={14} className="text-green-600" />
          <p className="text-green-700 text-xs">Kategori berhasil ditambahkan</p>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {pending && <Loader2 size={14} className="animate-spin" />}
        {pending ? 'Menyimpan...' : 'Tambah Kategori'}
      </button>
    </form>
  )
}
