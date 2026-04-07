'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pagamento } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'

export default function PagamentosDistribuidoraPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get contratos through lances (distribuidora_id doesn't exist on contratos)
      const { data: userLances } = await supabase
        .from('lances')
        .select('id')
        .eq('dist_id', user.id)

      if (!userLances || userLances.length === 0) {
        setPagamentos([])
        setLoading(false)
        return
      }

      const lanceIds = userLances.map(l => l.id)
      const { data: userContratos } = await supabase
        .from('contratos')
        .select('id')
        .in('lance_id', lanceIds)

      if (!userContratos || userContratos.length === 0) {
        setPagamentos([])
        setLoading(false)
        return
      }

      const contratoIds = userContratos.map(c => c.id)
      const { data } = await supabase
        .from('pagamentos')
        .select('*, contrato:contratos(*, leilao:leiloes(*))')
        .in('contrato_id', contratoIds)
        .order('created_at', { ascending: false })
      setPagamentos(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagamentos</h1>
      {pagamentos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">Nenhum pagamento registrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pagamentos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">R$ {p.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-500">{p.contrato?.leilao?.combustivel} - {p.contrato?.leilao?.volume?.toLocaleString()}L</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
