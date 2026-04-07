'use client'

import Sidebar from '@/components/Sidebar'

const items = [
  { label: 'Dashboard', href: '/distribuidora/dashboard', icon: '📊' },
  { label: 'Leilões', href: '/distribuidora/leiloes', icon: '🔥' },
  { label: 'Analytics', href: '/distribuidora/analytics', icon: '📈' },
  { label: 'Contratos', href: '/distribuidora/contratos', icon: '📄' },
  { label: 'Pagamentos', href: '/distribuidora/pagamentos', icon: '💰' },
  { label: 'NF-es', href: '/distribuidora/nfes', icon: '🧾' },
  { label: 'Perfil', href: '/distribuidora/perfil', icon: '👤' },
]

export default function DistribuidoraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} tipo="distribuidora" />
      <main className="flex-1 p-6 bg-bg">{children}</main>
    </div>
  )
}
