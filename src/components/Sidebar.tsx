'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface SidebarItem {
  label: string
  href: string
  icon: string
}

export default function Sidebar({ items, tipo }: { items: SidebarItem[]; tipo: 'posto' | 'distribuidora' }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const nav = (
    <aside className="w-[260px] min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-50">
        <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-black text-lg">F</div>
        <span className="text-lg font-bold text-gray-900">FuelBid</span>
      </Link>
      <div className="px-5 pt-4 pb-2">
        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
          {tipo === 'posto' ? 'Painel do Posto' : 'Painel Distribuidora'}
        </span>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== `/${tipo}/dashboard`)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-[#FFF1E8] text-brand font-semibold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-50">
        <button onClick={handleLogout} className="w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left">
          Sair
        </button>
      </div>
    </aside>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">{nav}</div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative">{nav}</div>
        </div>
      )}
    </>
  )
}
