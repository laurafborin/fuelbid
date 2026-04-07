'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao } from '@/lib/types'
import MetricCard from '@/components/MetricCard'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import Link from 'next/link'

export default function PostoDashboard() {
  const [leiloes, setLeiloes] = useState<Leilao[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('leiloes')
        .select('*')
        .eq('posto_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setLeiloes(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const abertos = leiloes.filter(l => l.status === 'aberto').length
  const contratados = leiloes.filter(l => l.status === 'contratado').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/posto/novo-leilao" className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark">
          + Novo Leilao
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Leiloes Abertos" value={abertos} icon="🔥" />
        <MetricCard label="Contratados" value={contratados} icon="✅" />
        <MetricCard label="Total Leiloes" value={leiloes.length} icon="📋" />
        <MetricCard label="Economia Est." value="R$ --" icon="💰" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Leiloes Recentes</h2>
      {loading ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : leiloes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-4">Nenhum leilao criado ainda</p>
          <Link href="/posto/novo-leilao" className="text-brand font-medium hover:underline">Criar primeiro leilao</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Combustivel</th>
                <th className="text-left px-4 py-3 font-medium">Volume</th>
                <th className="text-left px-4 py-3 font-medium">Preco Teto</th>
                <th className="text-left px-4 py-3 font-medium">Tempo Restante</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leiloes.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{l.combustivel}</td>
                  <td className="px-4 py-3">{l.volume?.toLocaleString()}L</td>
                  <td className="px-4 py-3">R$ {l.preco_teto?.toFixed(2)}</td>
                  <td className="px-4 py-3"><Countdown endDate={l.deadline} /></td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3">
                    <Link href={`/posto/leilao/${l.id}`} className="text-brand hover:underline text-xs">Ver</Link>
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
