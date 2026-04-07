'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao } from '@/lib/types'
import MetricCard from '@/components/MetricCard'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import { SkeletonMetric, SkeletonTable } from '@/components/Skeleton'
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
        <Link href="/posto/novo-leilao" className="px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark active:scale-[0.98] transition-all">
          + Novo Leilão
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonMetric key={i} />)}</div>
          <SkeletonTable rows={4} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Leilões Abertos" value={abertos} icon="🔥" />
            <MetricCard label="Contratados" value={contratados} icon="✅" />
            <MetricCard label="Total Leilões" value={leiloes.length} icon="📋" />
            <MetricCard label="Economia Est." value="R$ --" icon="💰" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leilões Recentes</h2>
          {leiloes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <p className="text-lg font-medium text-gray-400">Nenhum leilão criado ainda</p>
              <p className="text-sm text-gray-300">Crie seu primeiro leilão e comece a receber propostas de distribuidoras</p>
              <Link href="/posto/novo-leilao" className="px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand-dark transition-colors">
                Criar Primeiro Leilão
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50/50 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="text-left px-4 py-3">Combustível</th>
                      <th className="text-left px-4 py-3">Volume</th>
                      <th className="text-left px-4 py-3">Preço Teto</th>
                      <th className="text-left px-4 py-3">Tempo</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {leiloes.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{l.combustivel}</td>
                        <td className="px-4 py-3">{l.volume?.toLocaleString()}L</td>
                        <td className="px-4 py-3">R$ {l.preco_teto?.toFixed(2)}</td>
                        <td className="px-4 py-3"><Countdown endDate={l.deadline} /></td>
                        <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                        <td className="px-4 py-3">
                          <Link href={`/posto/leilao/${l.id}`} className="text-brand hover:underline text-xs font-medium">Ver</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
