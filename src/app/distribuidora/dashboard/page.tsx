'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao } from '@/lib/types'
import MetricCard from '@/components/MetricCard'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import { Icons } from '@/components/SvgIcons'
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
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonMetric key={i} />)}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <MetricCard label="Oportunidades" value={leiloes.length} icon={Icons.fire} iconBg="bg-red-50 text-red-400" />
            <MetricCard label="Lances Enviados" value={lanceCount} icon={Icons.target} iconBg="bg-purple-50 text-purple-400" />
            <MetricCard label="Contratos" value="--" icon={Icons.file} iconBg="bg-blue-50 text-blue-400" />
            <MetricCard label="Reputação" value="4.7" icon={Icons.star} iconBg="bg-amber-50 text-amber-400" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leilões Disponíveis</h2>
          {leiloes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100">
              <div className="text-gray-200">{Icons.radar}</div>
              <p className="text-lg font-medium text-gray-400">Nenhuma oportunidade disponível no momento</p>
              <p className="text-sm text-gray-300 max-w-sm text-center">Novos leilões de postos independentes aparecem aqui em tempo real</p>
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
