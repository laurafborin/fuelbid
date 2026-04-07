'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, type ReactNode } from 'react'
import { Icons } from './SvgIcons'

interface SidebarItem { label: string; href: string; icon: ReactNode }

const postoItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/posto/dashboard', icon: Icons.grid },
  { label: 'Novo Leilão', href: '/posto/novo-leilao', icon: Icons.plus },
  { label: 'Contratos', href: '/posto/contratos', icon: Icons.file },
  { label: 'Pagamentos', href: '/posto/pagamentos', icon: Icons.card },
  { label: 'NF-es', href: '/posto/nfes', icon: Icons.check },
  { label: 'Perfil', href: '/posto/perfil', icon: Icons.user },
]

const distItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/distribuidora/dashboard', icon: Icons.grid },
  { label: 'Leilões', href: '/distribuidora/leiloes', icon: Icons.fire },
  { label: 'Analytics', href: '/distribuidora/analytics', icon: Icons.chart },
  { label: 'Contratos', href: '/distribuidora/contratos', icon: Icons.file },
  { label: 'Pagamentos', href: '/distribuidora/pagamentos', icon: Icons.card },
  { label: 'NF-es', href: '/distribuidora/nfes', icon: Icons.check },
  { label: 'Perfil', href: '/distribuidora/perfil', icon: Icons.user },
]

export default function Sidebar({ tipo }: { tipo: 'posto' | 'distribuidora'; items?: unknown }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('')

  const navItems = tipo === 'posto' ? postoItems : distItems

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('nome').eq('id', user.id).single()
      setUserName(data?.nome || '')
    }
    loadUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const nav = (
    <aside className="w-[260px] min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-6 pt-6 pb-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8621A] flex items-center justify-center text-white font-black text-xl">F</div>
          <span className="text-xl font-bold text-gray-900">Fuel<span className="text-[#E8621A]">Bid</span></span>
        </Link>
      </div>

      {/* User card */}
      {userName && (
        <div className="mx-4 mt-2 mb-6 p-3 bg-gradient-to-r from-[#FFF1E8] to-[#FEF3EC] rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E8621A] text-white font-semibold text-sm flex items-center justify-center flex-shrink-0">{userName.charAt(0)}</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-[#E8621A]/70 capitalize">{tipo}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav label */}
      <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-[0.15em] px-6 mb-1 mt-2">
        {tipo === 'posto' ? 'Painel do Posto' : 'Painel da Distribuidora'}
      </p>

      {/* Nav items */}
      <nav className="flex-1 mt-1 space-y-0.5">
        {navItems.map(item => {
          const active = pathname === item.href || (item.href !== `/${tipo}/dashboard` && pathname.startsWith(item.href + '/'))
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`mx-3 px-3 py-2.5 rounded-xl flex items-center gap-3 text-[13px] cursor-pointer transition-all duration-150 ${
                active
                  ? 'bg-[#E8621A] text-white font-semibold shadow-sm shadow-[#E8621A]/20'
                  : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="mx-6 my-2 border-t border-gray-100" />
      <div className="p-3">
        <button onClick={handleLogout} className="w-full mx-0 px-3 py-2.5 rounded-xl flex items-center gap-3 text-[13px] text-gray-300 hover:text-red-400 transition-colors">
          {Icons.logout}
          Sair
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <div className="hidden lg:block">{nav}</div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative">{nav}</div>
        </div>
      )}
    </>
  )
}
