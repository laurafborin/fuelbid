'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao, Lance } from '@/lib/types'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'

export default function DistribuidoraLeilaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [leilao, setLeilao] = useState<Leilao | null>(null)
  const [lances, setLances] = useState<Lance[]>([])
  const [preco, setPreco] = useState('')
  const [prazo, setPrazo] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: l } = await supabase.from('leiloes').select('*, posto:profiles(*)').eq('id', id).single()
      setLeilao(l)
      const { data: lancesData } = await supabase
        .from('lances')
        .select('*, distribuidora:profiles!lances_dist_id_fkey(*)')
        .eq('leilao_id', id)
        .order('preco', { ascending: true })
      setLances(lancesData || [])
      setLoading(false)
    }
    load()

    const channel = supabase
      .channel(`lances-dist-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lances', filter: `leilao_id=eq.${id}` }, (payload) => {
        setLances(prev => [...prev, payload.new as Lance].sort((a, b) => a.preco - b.preco))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  async function enviarLance(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('lances').insert({
      leilao_id: id,
      dist_id: user.id,
      preco: parseFloat(preco),
      prazo: parseInt(prazo) || 7,
    })

    setPreco('')
    setPrazo('')
    setSending(false)
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>
  if (!leilao) return <p className="text-gray-500">Leilao não encontrado</p>

  const margem = preco ? ((leilao.preco_teto - parseFloat(preco)) / leilao.preco_teto * 100) : 0

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Leilão — {leilao.combustivel}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div><span className="text-gray-500">Posto</span><p className="font-semibold">{leilao.posto?.nome}</p></div>
              <div><span className="text-gray-500">Volume</span><p className="font-semibold">{leilao.volume?.toLocaleString()}L</p></div>
              <div><span className="text-gray-500">Preço Teto</span><p className="font-semibold">R$ {leilao.preco_teto?.toFixed(2)}</p></div>
              <div><span className="text-gray-500">Status</span><p><StatusBadge status={leilao.status} /></p></div>
              <div><span className="text-gray-500">Região</span><p className="font-semibold">{leilao.regiao}</p></div>
              <div><span className="text-gray-500">Prazo</span><p className="font-semibold">{leilao.prazo_entrega}</p></div>
              <div><span className="text-gray-500">Pagamento</span><p className="font-semibold">{leilao.forma_pagamento}</p></div>
              <div><span className="text-gray-500">Tempo</span><p><Countdown endDate={leilao.deadline} /></p></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold mb-4">Ranking de Lances ({lances.length})</h2>
            {lances.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum lance ainda. Seja o primeiro!</p>
            ) : (
              <div className="space-y-2">
                {lances.map((lance, i) => (
                  <div key={lance.id} className={`flex items-center justify-between p-3 rounded-lg border ${i === 0 ? 'border-brand bg-brand/5' : 'border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-brand text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm">{lance.distribuidora?.nome || 'Distribuidora'}</p>
                        <p className="text-xs text-gray-500">Prazo: {lance.prazo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {lance.preco?.toFixed(3)}</p>
                      <p className="text-xs text-gray-500">{((leilao.preco_teto - lance.preco) / leilao.preco_teto * 100).toFixed(1)}% abaixo do teto</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {leilao.status === 'aberto' && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold mb-4">Dar Lance</h3>
              <form onSubmit={enviarLance} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Preço por Litro (R$)</label>
                  <input type="number" step="0.001" value={preco} onChange={e => setPreco(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand" />
                  {preco && (
                    <p className={`text-xs mt-1 ${margem > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Margem vs teto: {margem.toFixed(1)}%
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prazo de Entrega (dias)</label>
                  <input type="number" min="1" max="90" value={prazo} onChange={e => setPrazo(e.target.value)} required placeholder="7" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-brand" />
                </div>
                <button type="submit" disabled={sending} className="w-full py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand-dark disabled:opacity-50">
                  {sending ? 'Enviando...' : 'Enviar Lance'}
                </button>
              </form>
            </div>
          )}

          {preco && (
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-sm mb-3">Simulacao</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Valor Total</span><span className="font-medium">R$ {(parseFloat(preco) * leilao.volume).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Economia p/ Posto</span><span className="font-medium text-green-600">R$ {((leilao.preco_teto - parseFloat(preco)) * leilao.volume).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
