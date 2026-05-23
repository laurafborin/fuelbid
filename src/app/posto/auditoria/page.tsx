'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Contrato } from '@/lib/types'
import { auditarContratos, brl, pct, ANP_REFERENCIA_DATA, type AuditoriaResumo } from '@/lib/anp'
import MetricCard from '@/components/MetricCard'
import { Icons } from '@/components/SvgIcons'
import { SkeletonMetric, SkeletonTable } from '@/components/Skeleton'

export default function AuditoriaPage() {
  const [resumo, setResumo] = useState<AuditoriaResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('contratos')
        .select('*, leilao:leiloes(*), lance:lances(*, distribuidora:profiles!lances_dist_id_fkey(*))')
        .eq('posto_id', user.id)
        .order('created_at', { ascending: false })
      setResumo(auditarContratos((data as Contrato[]) || []))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Auditoria de Economia</h1>
        <p className="text-gray-500 text-sm mt-1">
          Quanto a plataforma economizou de verdade — medido contra o seu preço-teto e a
          referência ANP de distribuição.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonMetric key={i} />)}</div>
          <SkeletonTable rows={4} />
        </div>
      ) : !resumo || resumo.totalContratos === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-2xl border border-gray-100">
          <div className="text-gray-200">{Icons.calculator}</div>
          <p className="text-lg font-medium text-gray-400">Nenhum contrato fechado para auditar ainda</p>
          <p className="text-sm text-gray-400">Feche um leilão e a economia aparecerá aqui automaticamente.</p>
        </div>
      ) : (
        <>
          {/* Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              label="Economia vs. ANP"
              value={brl(resumo.economiaAnpTotal)}
              icon={Icons.dollar}
              iconBg="bg-green-50 text-green-500"
              sub={`em ${resumo.cobertosPorAnp} contrato(s)`}
            />
            <MetricCard
              label="Desconto médio"
              value={pct(resumo.descontoMedioAnp)}
              icon={Icons.trending}
              iconBg="bg-[#FFF1E8] text-[#E8621A]"
              sub="ponderado por volume"
            />
            <MetricCard
              label="Economia vs. teto"
              value={brl(resumo.economiaTetoTotal)}
              icon={Icons.target}
              iconBg="bg-blue-50 text-blue-500"
              sub="vs. preço máximo definido"
            />
            <MetricCard
              label="Volume auditado"
              value={`${resumo.volumeTotal.toLocaleString('pt-BR')} L`}
              icon={Icons.layers}
              iconBg="bg-purple-50 text-purple-500"
            />
          </div>

          {/* Tabela detalhada */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhamento por contrato</h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Combustível</th>
                    <th className="text-right px-4 py-3 font-medium">Volume</th>
                    <th className="text-right px-4 py-3 font-medium">Pago / L</th>
                    <th className="text-right px-4 py-3 font-medium">Ref. ANP / L</th>
                    <th className="text-right px-4 py-3 font-medium">Desconto</th>
                    <th className="text-right px-4 py-3 font-medium">Economia (R$)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resumo.itens.map((it) => {
                    const temAnp = it.economiaAnpPct !== null
                    const positivo = (it.economiaAnpRS ?? 0) >= 0
                    return (
                      <tr key={it.contrato.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{it.combustivel}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{it.volume.toLocaleString('pt-BR')} L</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-900">R$ {it.precoLitro.toFixed(3)}</td>
                        <td className="px-4 py-3 text-right font-mono text-gray-400">
                          {it.refAnp ? `R$ ${it.refAnp.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {temAnp ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-gray-100 overflow-hidden hidden sm:block">
                                <div
                                  className={`h-full rounded-full ${positivo ? 'bg-green-400' : 'bg-red-400'}`}
                                  style={{ width: `${Math.min(100, Math.abs((it.economiaAnpPct as number) * 100) * 4)}%` }}
                                />
                              </div>
                              <span className={`font-semibold ${positivo ? 'text-green-600' : 'text-red-500'}`}>
                                {pct(it.economiaAnpPct as number)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${positivo ? 'text-green-600' : 'text-red-500'}`}>
                          {temAnp ? brl(it.economiaAnpRS as number) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 font-semibold text-gray-900">
                  <tr>
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{resumo.volumeTotal.toLocaleString('pt-BR')} L</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right text-green-600">{pct(resumo.descontoMedioAnp)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{brl(resumo.economiaAnpTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Metodologia */}
          <div className="mt-6 bg-[#FFF1E8] border border-[#E8621A]/10 rounded-2xl p-5 text-sm text-gray-600 flex gap-3">
            <div className="text-[#E8621A] flex-shrink-0">{Icons.alert}</div>
            <div>
              <p className="font-semibold text-gray-800 mb-1">Como a economia é calculada</p>
              <p>
                Para cada contrato, o preço efetivamente pago por litro (valor ÷ volume) é
                comparado à referência de distribuição da ANP para aquele combustível. A
                economia é a diferença multiplicada pelo volume contratado. O desconto médio é
                ponderado pelo volume de cada negociação. Fonte da referência: {ANP_REFERENCIA_DATA}.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
