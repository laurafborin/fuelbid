'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pagamento } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'

export default function PagamentosDistPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('pagamentos')
        .select('*, contrato:contratos(*, leilao:leiloes(*))')
        .order('created_at', { ascending: false })
      setPagamentos((data || []).filter((p: Pagamento) => p.contrato?.dist_id === user.id))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagamentos</h1>
      {pagamentos.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
          <svg width="48" height="48" className="text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h5.25A2.25 2.25 0 0121 6v6zm0 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6" /></svg>
          <p className="text-lg font-medium text-gray-400 mt-4">Nenhum pagamento registrado</p>
          <p className="text-sm text-gray-300">Pagamentos aparecem apos a assinatura de contratos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pagamentos.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">R$ {p.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{p.contrato?.leilao?.combustivel} — {p.contrato?.leilao?.volume?.toLocaleString()} L</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.pago_em && <p className="text-xs text-gray-400 mt-2">Pago em {new Date(p.pago_em).toLocaleDateString('pt-BR')}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
