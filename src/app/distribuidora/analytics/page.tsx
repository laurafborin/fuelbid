'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MetricCard from '@/components/MetricCard'

const regioes = ['SP Capital', 'SP Interior', 'RJ', 'MG', 'PR', 'SC', 'RS']

const insights = [
  { titulo: 'Oportunidade de Preco', texto: 'Leiloes de Diesel S10 na regiao SP Interior apresentam margens 12% acima da media. Considere priorizar lances nesta categoria.' },
  { titulo: 'Padrao de Demanda', texto: 'Volume de Gasolina Comum tem crescimento de 8% nos ultimos 30 dias. Tendencia de alta sugere oportunidade de escala.' },
  { titulo: 'Competitividade Regional', texto: 'Sua taxa de conversao em MG (45%) e 2x maior que em SP Capital (22%). Foque recursos na regiao com melhor aproveitamento.' },
]

export default function AnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contratos, setContratos] = useState<any[]>([])
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
  const roi = totalReceita > 0 ? ((totalReceita * 0.08) / totalReceita * 100) : 0

  const regionData = regioes.map((r) => ({ nome: r, valor: Math.floor(Math.random() * 100) }))
  const maxRegion = Math.max(...regionData.map(r => r.valor), 1)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <MetricCard label="Ticket Medio" value={`R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} icon="🎫" />
            <MetricCard label="Margem Media/L" value={`R$ ${margemMedia.toFixed(3)}`} icon="📊" />
            <MetricCard label="Economia Gerada" value={`R$ ${(totalReceita * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} icon="💰" />
            <MetricCard label="Custo Oportunidade" value={`R$ ${(totalReceita * 0.02).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} icon="⚠️" />
            <MetricCard label="ROI" value={`${roi.toFixed(1)}%`} icon="📈" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold mb-4">Market Share por Combustivel</h2>
              <div className="space-y-3">
                {['Gasolina Comum', 'Diesel S10', 'Etanol', 'Gasolina Aditivada'].map((comb) => {
                  const count = contratos.filter(c => c.leilao?.combustivel === comb).length
                  const pct = contratos.length > 0 ? (count / contratos.length * 100) : 0
                  return (
                    <div key={comb}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{comb}</span>
                        <span className="font-medium">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="font-semibold mb-4">Alcance por Regiao</h2>
              <div className="space-y-2">
                {regionData.map((r) => (
                  <div key={r.nome} className="flex items-center gap-3">
                    <span className="text-sm w-20 text-gray-600">{r.nome}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
                      <div className="h-full bg-brand/80 rounded" style={{ width: `${(r.valor / maxRegion) * 100}%` }} />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{r.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="font-semibold mb-4">Insights IA</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {insights.map((insight, i) => (
                <div key={i} className="p-4 bg-brand/5 rounded-lg border border-brand/10">
                  <h3 className="font-semibold text-sm text-brand mb-2">{insight.titulo}</h3>
                  <p className="text-xs text-gray-700">{insight.texto}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
