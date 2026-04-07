'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao } from '@/lib/types'
import MetricCard from '@/components/MetricCard'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import Link from 'next/link'

export default function DistribuidoraDashboard() {
  const [leiloes, setLeiloes] = useState<Leilao[]>([])
  const [lanceCount, setLanceCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: leiloesAbertos } = await supabase
        .from('leiloes')
        .select('*')
        .eq('status', 'aberto')
        .order('created_at', { ascending: false })
        .limit(10)
      setLeiloes(leiloesAbertos || [])

      const { count } = await supabase
        .from('lances')
        .select('*', { count: 'exact', head: true })
        .eq('distribuidora_id', user.id)
      setLanceCount(count || 0)

      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Leilões Abertos" value={leiloes.length} icon="🔥" />
        <MetricCard label="Meus Lances" value={lanceCount} icon="🎯" />
        <MetricCard label="Taxa de Conversão" value="--%" icon="📈" />
        <MetricCard label="Receita Est." value="R$ --" icon="💰" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Leilões Abertos</h2>
      {loading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : leiloes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">Nenhum leilão aberto no momento</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Combustível</th>
                <th className="text-left px-4 py-3 font-medium">Volume</th>
                <th className="text-left px-4 py-3 font-medium">Preço Teto</th>
                <th className="text-left px-4 py-3 font-medium">Região</th>
                <th className="text-left px-4 py-3 font-medium">Tempo</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leiloes.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{l.combustivel}</td>
                  <td className="px-4 py-3">{l.volume_litros?.toLocaleString()}L</td>
                  <td className="px-4 py-3">R$ {l.preco_teto?.toFixed(2)}</td>
                  <td className="px-4 py-3">{l.regiao}</td>
                  <td className="px-4 py-3"><Countdown endDate={l.end_time} /></td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/distribuidora/leilao/${l.id}`} className="text-brand hover:underline text-xs">Dar Lance</Link>
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
