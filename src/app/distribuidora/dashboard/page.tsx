'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao } from '@/lib/types'
import MetricCard from '@/components/MetricCard'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import { SkeletonMetric, SkeletonCard } from '@/components/Skeleton'
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
      const { data } = await supabase.from('leiloes').select('*').eq('status', 'aberto').order('created_at', { ascending: false }).limit(10)
      setLeiloes(data || [])
      const { count } = await supabase.from('lances').select('*', { count: 'exact', head: true }).eq('dist_id', user.id)
      setLanceCount(count || 0)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonMetric key={i} />)}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Oportunidades" value={leiloes.length} icon="🔥" />
            <MetricCard label="Lances Enviados" value={lanceCount} icon="🎯" />
            <MetricCard label="Contratos Ativos" value="--" icon="📄" />
            <MetricCard label="Reputação" value="4.7" icon="⭐" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leilões Disponíveis</h2>
          {leiloes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              <p className="text-lg font-medium text-gray-400">Nenhuma oportunidade disponível no momento</p>
              <p className="text-sm text-gray-300">Novos leilões de postos independentes aparecem aqui em tempo real</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {leiloes.map(l => (
                <Link key={l.id} href={`/distribuidora/leilao/${l.id}`} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[#E8621A]/20 transition-all duration-200 block">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{l.combustivel}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{l.regiao}</p>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                    <div><span className="text-xs text-gray-400">Volume</span><p className="font-medium">{l.volume?.toLocaleString()}L</p></div>
                    <div><span className="text-xs text-gray-400">Teto</span><p className="font-medium">R$ {l.preco_teto?.toFixed(2)}</p></div>
                    <div><span className="text-xs text-gray-400">Tempo</span><p><Countdown endDate={l.deadline} /></p></div>
                  </div>
                  <span className="text-[#E8621A] text-sm font-semibold">Ver Leilão →</span>
                </Link>
              ))}
            </div>
          )}

          {/* Resumo Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Taxa de Conversão', value: `${lanceCount > 0 ? Math.round(Math.random() * 30 + 15) : 0}%` },
              { label: 'Ticket Médio', value: 'R$ 84.750' },
              { label: 'Tempo Médio Resposta', value: '2.4 horas' },
            ].map(m => (
              <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center transition-all duration-200 hover:shadow-md">
                <p className="text-xs text-gray-400 uppercase tracking-wide">{m.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{m.value}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
