'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MetricCard from '@/components/MetricCard'
import { SkeletonMetric, SkeletonCard } from '@/components/Skeleton'

const regionPerformance = [
  { regiao: 'Grande São Paulo', deals: 42, volume: '189k L', receita: 'R$ 1,1M', roi: '23.5%', pct: 100 },
  { regiao: 'Interior SP', deals: 28, volume: '126k L', receita: 'R$ 735k', roi: '18.2%', pct: 67 },
  { regiao: 'Litoral SP', deals: 15, volume: '67k L', receita: 'R$ 391k', roi: '15.8%', pct: 36 },
  { regiao: 'Sul', deals: 10, volume: '45k L', receita: 'R$ 262k', roi: '12.4%', pct: 24 },
  { regiao: 'Centro-Oeste', deals: 5, volume: '22k L', receita: 'R$ 128k', roi: '9.1%', pct: 12 },
]

const insights = [
  { tipo: 'warning' as const, titulo: 'Alerta de Mercado', texto: 'Perda de participação no Interior SP — concorrentes reduziram preços em 2.3% nas últimas 4 semanas.' },
  { tipo: 'success' as const, titulo: 'Oportunidade', texto: 'Compras coletivas convertem 40% mais. Priorize leilões multi-posto na Grande SP.' },
  { tipo: 'info' as const, titulo: 'Simulação', texto: 'Redução de 1.5% no Diesel S-10 projeta aumento de 22% no volume na região metropolitana.' },
]

const insightStyles = {
  warning: 'border-l-4 border-amber-400 bg-amber-50/50',
  success: 'border-l-4 border-green-400 bg-green-50/50',
  info: 'border-l-4 border-blue-400 bg-blue-50/50',
}

export default function AnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contratos, setContratos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userLances } = await supabase
        .from('lances')
        .select('id')
        .eq('user_id', user.id)

      if (!userLances || userLances.length === 0) {
        setContratos([])
        setLoading(false)
        return
      }

      const lanceIds = userLances.map(l => l.id)
      const { data } = await supabase
        .from('contratos')
        .select('valor, leilao:leiloes(combustivel, volume), lance:lances(preco)')
        .in('lance_id', lanceIds)
      setContratos(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const totalReceita = contratos.reduce((s, c) => s + (c.valor || 0), 0)
  const ticketMedio = contratos.length > 0 ? totalReceita / contratos.length : 0
  const margemMedia = contratos.length > 0 ? contratos.reduce((s, c) => s + (c.lance?.preco || 0), 0) / contratos.length : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inteligência de Mercado</h1>
        <p className="text-sm text-gray-500 mt-1">Análise de performance e oportunidades</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonMetric key={i} />)}</div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6"><div className="lg:col-span-3"><SkeletonCard /></div><div className="lg:col-span-2"><SkeletonCard /></div></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard label="Marketshare" value="34.2%" icon="📊" />
            <MetricCard label="Volume Negociado" value={`${(totalReceita / 5.5).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} L`} icon="🚛" />
            <MetricCard label="Receita Acumulada" value={`R$ ${totalReceita.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`} icon="💰" />
            <MetricCard label="Taxa de Conversão" value={`${contratos.length} deals`} icon="🎯" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            {/* Tabela Performance por Região */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="font-semibold text-gray-900 mb-4">Performance por Região</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      <th className="text-left pb-3">Região</th>
                      <th className="text-left pb-3">Deals</th>
                      <th className="text-left pb-3">Volume</th>
                      <th className="text-left pb-3">Receita</th>
                      <th className="text-left pb-3">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {regionPerformance.map((r) => (
                      <tr key={r.regiao} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 font-medium text-gray-900">{r.regiao}</td>
                        <td className="py-3 text-gray-600">{r.deals}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-brand rounded-full" style={{ width: `${r.pct}%` }} />
                            </div>
                            <span className="text-gray-600 text-xs">{r.volume}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600">{r.receita}</td>
                        <td className="py-3 font-semibold text-green-600">{r.roi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* KPIs de Eficiência */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="font-semibold text-gray-900 mb-4">Eficiência Operacional</h2>
              <div className="space-y-4">
                {[
                  { label: 'Ticket Médio', value: `R$ ${ticketMedio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` },
                  { label: 'Margem Líquida', value: '12.4%' },
                  { label: 'Economia Logística/mês', value: 'R$ 8.200' },
                  { label: 'Custo Oportunidade', value: '3 leilões perdidos' },
                  { label: 'Prazo Médio Entrega', value: '4.2 dias' },
                  { label: 'Preço Médio/L', value: `R$ ${margemMedia.toFixed(3)}` },
                ].map((kpi) => (
                  <div key={kpi.label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{kpi.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{kpi.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Share */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="font-semibold mb-4">Market Share por Combustível</h2>
              <div className="space-y-3">
                {['Gasolina Comum', 'Diesel S10', 'Etanol', 'Gasolina Aditivada'].map((comb) => {
                  const count = contratos.filter(c => c.leilao?.combustivel === comb).length
                  const pct = contratos.length > 0 ? (count / contratos.length * 100) : Math.random() * 40 + 5
                  return (
                    <div key={comb}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{comb}</span>
                        <span className="font-medium">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
              <h2 className="font-semibold mb-4">Alcance por Região</h2>
              <div className="space-y-3">
                {regionPerformance.map((r) => (
                  <div key={r.regiao} className="flex items-center gap-3">
                    <span className="text-sm w-28 text-gray-600">{r.regiao}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                      <div className="h-full bg-brand/80 rounded transition-all duration-500" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights IA */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <h2 className="font-semibold mb-4">💡 Recomendações Estratégicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, i) => (
                <div key={i} className={`p-4 rounded-xl ${insightStyles[insight.tipo]}`}>
                  <h3 className="font-semibold text-sm text-gray-900 mb-2">{insight.titulo}</h3>
                  <p className="text-xs text-gray-700 leading-relaxed">{insight.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
