'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Contrato } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import Link from 'next/link'

export default function ContratosDistribuidoraPage() {
  const [contratos, setContratos] = useState<Contrato[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('contratos')
        .select('*, posto:profiles!contratos_posto_id_fkey(*)')
        .eq('distribuidora_id', user.id)
        .order('created_at', { ascending: false })
      setContratos(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contratos</h1>
      {contratos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">Nenhum contrato ainda</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Combustível</th>
                <th className="text-left px-4 py-3 font-medium">Posto</th>
                <th className="text-left px-4 py-3 font-medium">Volume</th>
                <th className="text-left px-4 py-3 font-medium">Valor Total</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {contratos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.combustivel}</td>
                  <td className="px-4 py-3">{c.posto?.nome_fantasia}</td>
                  <td className="px-4 py-3">{c.volume_litros?.toLocaleString()}L</td>
                  <td className="px-4 py-3">R$ {c.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/distribuidora/contrato/${c.id}`} className="text-brand hover:underline text-xs">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
