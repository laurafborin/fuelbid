'use client'

import Sidebar from '@/components/Sidebar'

const items = [
  { label: 'Dashboard', href: '/posto/dashboard', icon: '📊' },
  { label: 'Novo Leilão', href: '/posto/novo-leilao', icon: '➕' },
  { label: 'Contratos', href: '/posto/contratos', icon: '📄' },
  { label: 'Pagamentos', href: '/posto/pagamentos', icon: '💰' },
  { label: 'NF-es', href: '/posto/nfes', icon: '🧾' },
  { label: 'Perfil', href: '/posto/perfil', icon: '👤' },
]

export default function PostoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} tipo="posto" />
      <main className="flex-1 p-6 bg-bg">{children}</main>
    </div>
  )
}
