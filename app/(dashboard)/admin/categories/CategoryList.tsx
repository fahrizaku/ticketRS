'use client'

import { useTransition } from 'react'
import { Tag, Trash2, Loader2 } from 'lucide-react'
import { deleteCategory } from '@/app/actions/categories'

type Category = { id: string; name: string; description: string | null; _count: { tickets: number } }

export function CategoryList({ categories }: { categories: Category[] }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus kategori "${name}"? Tidak bisa dibatalkan.`)) return
    startTransition(async () => {
      await deleteCategory(id)
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {categories.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Tag size={32} className="mx-auto mb-2 opacity-30" />
          <p>Belum ada kategori</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Tag size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                {cat.description && <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>}
              </div>
              <span className="text-xs text-gray-400 shrink-0">{cat._count.tickets} tiket</span>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={isPending || cat._count.tickets > 0}
                title={cat._count.tickets > 0 ? 'Tidak bisa hapus kategori yang masih memiliki tiket' : 'Hapus'}
                className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
