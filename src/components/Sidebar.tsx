'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SidebarItem {
  label: string
  href: string
  icon: string
}

export default function Sidebar({ items, tipo }: { items: SidebarItem[]; tipo: 'posto' | 'distribuidora' }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-[200px] min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <Link href="/" className="flex items-center gap-2 px-4 py-5 border-b border-gray-100">
        <span className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-lg">F</span>
        <span className="text-lg font-bold text-gray-900">FuelBid</span>
      </Link>
      <div className="px-3 py-2">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold px-2">
          {tipo === 'posto' ? 'Posto' : 'Distribuidora'}
        </span>
      </div>
      <nav className="flex-1 px-2 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                active
                  ? 'bg-brand/10 text-brand font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={handleLogout} className="w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition text-left">
          Sair
        </button>
      </div>
    </aside>
  )
}
