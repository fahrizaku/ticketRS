'use client'

import { User, Mail, Building, AtSign } from 'lucide-react'

type UserItem = {
  id: string
  name: string
  username: string
  email: string
  role: string
  department: string | null
  createdAt: Date
}

const ROLE_COLORS: Record<string, string> = {
  STAFF: 'bg-gray-100 text-gray-700',
  TEKNISI: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
}

export function UserList({ users, currentUserId }: { users: UserItem[]; currentUserId: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="divide-y divide-gray-100">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                {user.id === currentUserId && (
                  <span className="text-xs text-gray-400">(Anda)</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                  <AtSign size={11} /> {user.username}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                  <Mail size={11} /> {user.email}
                </span>
                {user.department && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Building size={11} /> {user.department}
                  </span>
                )}
              </div>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
              {user.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
