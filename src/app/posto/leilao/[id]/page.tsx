'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao, Lance } from '@/lib/types'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import MiniMap from '@/components/MiniMap'

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
      const { data: lancesData } = await supabase
        .from('lances')
        .select('*, distribuidora:profiles!lances_user_id_fkey(*)')
        .eq('leilao_id', id)
        .order('preco', { ascending: true })
      setLances(lancesData || [])
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
      leilao_id: leilao.id,
      lance_id: lance.id,
      posto_id: leilao.posto_id,
      valor,
      status: 'pendente',
    })

    await supabase.from('leiloes').update({ status: 'contratado' }).eq('id', leilao.id)
    setLeilao(prev => prev ? { ...prev, status: 'contratado' } : null)
    alert('Lance aceito! Contrato criado.')
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>
  if (!leilao) return <p className="text-gray-500">Leilao nao encontrado</p>

  const mapPoints = lances
    .filter(l => l.distribuidora)
    .map(l => ({ lat: l.distribuidora!.lat, lng: l.distribuidora!.lng, nome: l.distribuidora!.nome }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leilao — {leilao.combustivel}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-gray-500">Volume</span><p className="font-semibold">{leilao.volume?.toLocaleString()}L</p></div>
              <div><span className="text-gray-500">Preco Teto</span><p className="font-semibold">R$ {leilao.preco_teto?.toFixed(2)}</p></div>
              <div><span className="text-gray-500">Regiao</span><p className="font-semibold">{leilao.regiao}</p></div>
              <div><span className="text-gray-500">Status</span><p><StatusBadge status={leilao.status} /></p></div>
              <div><span className="text-gray-500">Prazo Entrega</span><p className="font-semibold">{leilao.prazo_entrega}</p></div>
              <div><span className="text-gray-500">Pagamento</span><p className="font-semibold">{leilao.forma_pagamento}</p></div>
              <div><span className="text-gray-500">Tipo</span><p className="font-semibold">{leilao.tipo_compra}</p></div>
              <div><span className="text-gray-500">Tempo</span><p><Countdown endDate={leilao.deadline} /></p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Lances ({lances.length})</h2>
            {lances.length === 0 ? (
              <p className="text-gray-500 text-sm">Aguardando lances das distribuidoras...</p>
            ) : (
              <div className="space-y-3">
                {lances.map((lance, i) => (
                  <div key={lance.id} className={`flex items-center justify-between p-4 rounded-lg border ${i === 0 ? 'border-brand bg-brand/5' : 'border-gray-100'}`}>
                    <div>
                      <p className="font-semibold text-sm">{lance.distribuidora?.nome || 'Distribuidora'}</p>
                      <p className="text-xs text-gray-500">Prazo: {lance.prazo}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-lg">R$ {lance.preco?.toFixed(3)}</p>
                        <p className="text-xs text-gray-500">Total: R$ {(lance.preco * leilao.volume).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      {leilao.status === 'aberto' && (
                        <button onClick={() => aceitarLance(lance)} className="px-3 py-1.5 text-xs bg-brand text-white rounded-lg hover:bg-brand-dark">
                          Aceitar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribuidoras Participantes</h3>
            <MiniMap points={mapPoints} />
          </div>
        </div>
      </div>
    </div>
  )
}
