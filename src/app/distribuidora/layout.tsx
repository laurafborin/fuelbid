'use client'

import Sidebar from '@/components/Sidebar'

export default function DistribuidoraLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar tipo="distribuidora" />
      <main className="flex-1 p-4 lg:p-6 bg-bg pt-16 lg:pt-6">{children}</main>
    </div>
  )
}
