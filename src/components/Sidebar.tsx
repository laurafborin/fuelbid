'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

interface SidebarItem { label: string; href: string; icon: string }

export default function Sidebar({ items, tipo }: { items: SidebarItem[]; tipo: 'posto' | 'distribuidora' }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userName, setUserName] = useState('')

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
    <aside className="w-[260px] min-h-screen bg-white border-r border-gray-100 flex flex-col pt-6">
      <div className="flex items-center gap-3 px-6 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-[#E8621A] flex items-center justify-center text-white font-black text-xl">F</div>
        <span className="text-xl font-bold text-gray-900">Fuel<span className="text-[#E8621A]">Bid</span></span>
      </div>

      {userName && (
        <div className="bg-[#FFF1E8] rounded-xl mx-4 p-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E8621A] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{userName.charAt(0)}</div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-400 capitalize">{tipo}</p>
            </div>
          </div>
        </div>
      )}

      <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-6 mb-2">
        {tipo === 'posto' ? 'Painel do Posto' : 'Painel da Distribuidora'}
      </p>
      <nav className="flex-1 space-y-0.5">
        {items.map(item => {
          const active = pathname === item.href || (item.href !== `/${tipo}/dashboard` && pathname.startsWith(item.href + '/'))
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl text-sm transition-all duration-150 ${
                active
                  ? 'bg-[#FFF1E8] text-[#E8621A] font-semibold border-l-[3px] border-[#E8621A]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-50">
        <button onClick={handleLogout} className="w-full px-4 py-2.5 text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all text-left">Sair</button>
      </div>
    </aside>
  )

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm">
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
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
