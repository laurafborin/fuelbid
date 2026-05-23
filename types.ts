'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao } from '@/lib/types'
import MetricCard from '@/components/MetricCard'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import { Icons } from '@/components/SvgIcons'
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
      const { data } = await supabase.from('leiloes').select('*').eq('posto_id', user.id).order('created_at', { ascending: false }).limit(10)
      setLeiloes(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const abertos = leiloes.filter(l => l.status === 'aberto').length
  const contratados = leiloes.filter(l => l.status === 'contratado').length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/posto/novo-leilao" className="bg-[#E8621A] hover:bg-[#C44E10] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-[#E8621A]/20 flex items-center gap-2 active:scale-[0.98]">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Novo Leilão
        </Link>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonMetric key={i} />)}</div>
          <SkeletonTable rows={4} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <MetricCard label="Leilões Ativos" value={abertos} icon={Icons.fire} iconBg="bg-red-50 text-red-400" />
            <MetricCard label="Contratados" value={contratados} icon={Icons.checkCircle} iconBg="bg-green-50 text-green-400" />
            <MetricCard label="Total Leilões" value={leiloes.length} icon={Icons.layers} iconBg="bg-blue-50 text-blue-400" />
            <MetricCard label="Economia Est." value="R$ 0" icon={Icons.trending} iconBg="bg-[#FFF1E8] text-[#E8621A]" sub="vs. preço teto" />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leilões Recentes</h2>
          {leiloes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100">
              <div className="text-gray-200">{Icons.megafone}</div>
              <p className="text-lg font-medium text-gray-400">Nenhum leilão criado ainda</p>
              <p className="text-sm text-gray-300 max-w-sm text-center">Crie seu primeiro leilão e comece a receber propostas de distribuidoras</p>
              <Link href="/posto/novo-leilao" className="mt-2 bg-[#E8621A] text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-[#C44E10] transition-colors">
                Criar Primeiro Leilão
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {leiloes.map(l => (
                <Link key={l.id} href={`/posto/leilao/${l.id}`} className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[#E8621A]/20 transition-all cursor-pointer">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{l.combustivel}</p>
                      <div className="flex gap-3 mt-1 items-center">
                        <span className="text-sm text-gray-400">{l.volume?.toLocaleString()}L</span>
                        <span className="text-gray-200">&middot;</span>
                        <span className="text-sm text-gray-400">R$ {l.preco_teto?.toFixed(2)}/L</span>
                        <StatusBadge status={l.status} />
                      </div>
                    </div>
                    {l.status === 'aberto' && <Countdown endDate={l.deadline} />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
