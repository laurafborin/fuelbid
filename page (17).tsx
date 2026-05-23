'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao, Lance } from '@/lib/types'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import Stars from '@/components/Stars'
import MiniMap from '@/components/MiniMap'
import Link from 'next/link'

export default function LeilaoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [leilao, setLeilao] = useState<Leilao | null>(null)
  const [lances, setLances] = useState<Lance[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: l } = await supabase.from('leiloes').select('*').eq('id', id).single()
      setLeilao(l)
      const { data: lc } = await supabase
        .from('lances')
        .select('*, distribuidora:profiles!lances_dist_id_fkey(*)')
        .eq('leilao_id', id)
        .order('preco', { ascending: true })
      setLances(lc || [])
      setLoading(false)
    }
    load()
    const channel = supabase
      .channel(`lances-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lances', filter: `leilao_id=eq.${id}` }, (payload) => {
        setLances(prev => [...prev, payload.new as Lance].sort((a, b) => a.preco - b.preco))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function aceitarLance(lance: Lance) {
    if (!leilao) return
    const valor = lance.preco * leilao.volume
    await supabase.from('contratos').insert({
      leilao_id: leilao.id, lance_id: lance.id, posto_id: leilao.posto_id, dist_id: lance.dist_id, valor, status: 'pendente_assinatura',
    })
    await supabase.from('leiloes').update({ status: 'contratado' }).eq('id', leilao.id)
    setLeilao(prev => prev ? { ...prev, status: 'contratado' } : null)
    alert('Proposta aceita! Contrato gerado.')
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
  if (!leilao) return <p className="text-gray-400">Leilao nao encontrado</p>

  const mapPoints = lances.filter(l => l.distribuidora).map(l => ({ lat: l.distribuidora!.lat, lng: l.distribuidora!.lng, nome: l.distribuidora!.nome }))

  return (
    <div>
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-1">
        <Link href="/posto/dashboard" className="hover:text-[#E8621A]">Dashboard</Link>
        <span className="mx-1.5 text-gray-300">/</span>
        <span className="text-gray-700 font-medium">{leilao.combustivel}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{leilao.combustivel}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <StatusBadge status={leilao.status} />
            <span className="text-sm text-gray-400">{lances.length} proposta{lances.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {leilao.status === 'aberto' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center min-w-[180px]">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Tempo Restante</p>
            <div className="mt-1"><Countdown endDate={leilao.deadline} /></div>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Volume', value: `${leilao.volume?.toLocaleString()} L`, sub: 'litros' },
          { label: 'Preco Teto', value: `R$ ${leilao.preco_teto?.toFixed(2)}/L`, sub: 'valor maximo' },
          { label: 'Prazo Entrega', value: `${leilao.prazo_entrega} dias`, sub: 'uteis' },
          { label: 'Pagamento', value: leilao.forma_pagamento, sub: leilao.regiao },
        ].map(info => (
          <div key={info.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">{info.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{info.value}</p>
            <p className="text-xs text-gray-400">{info.sub}</p>
          </div>
        ))}
      </div>

      {/* Map */}
      {mapPoints.length > 0 && <div className="mb-8"><MiniMap points={mapPoints} /></div>}

      {/* Lances */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Propostas Recebidas</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">Atualização em tempo real</span>
        </div>
      </div>

      {lances.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
          <svg width="48" height="48" className="text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-lg font-medium text-gray-400 mt-4">Aguardando propostas</p>
          <p className="text-sm text-gray-300">Distribuidoras podem enviar propostas enquanto o leilao estiver aberto</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lances.map((lance, i) => (
            <div key={lance.id} className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${i === 0 ? 'border-[#E8621A]/30 shadow-sm' : 'border-gray-100'}`}>
              <div className="flex items-center gap-4">
                {/* Position */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-[#E8621A] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {i + 1}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{lance.distribuidora?.nome || 'Distribuidora'}</p>
                    {i === 0 && <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">Melhor Oferta</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {lance.distribuidora?.score && <><Stars rating={lance.distribuidora.score} /><span className="text-xs text-gray-400">{lance.distribuidora.score.toFixed(1)}</span></>}
                  </div>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-gray-400">Prazo: {lance.prazo} dias</span>
                    {lance.observacoes && <span className="text-xs text-gray-400">{lance.observacoes}</span>}
                  </div>
                </div>

                {/* Price + Action */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-2xl font-bold ${i === 0 ? 'text-[#E8621A]' : 'text-gray-900'}`}>R$ {lance.preco?.toFixed(3)}</p>
                  <p className="text-xs text-gray-400">Total: R$ {(lance.preco * leilao.volume).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  {leilao.status === 'aberto' && i === 0 && (
                    <button onClick={() => aceitarLance(lance)} className="mt-2 bg-[#E8621A] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#C44E10] transition-colors">
                      Aceitar Proposta
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
