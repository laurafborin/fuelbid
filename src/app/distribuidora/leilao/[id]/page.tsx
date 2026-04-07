'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao, Lance } from '@/lib/types'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import Stars from '@/components/Stars'
import Link from 'next/link'

export default function DistribuidoraLeilaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [leilao, setLeilao] = useState<Leilao | null>(null)
  const [lances, setLances] = useState<Lance[]>([])
  const [preco, setPreco] = useState('')
  const [prazo, setPrazo] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      const { data: l } = await supabase.from('leiloes').select('*, posto:profiles(*)').eq('id', id).single()
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
    await supabase.from('lances').insert({ leilao_id: id, dist_id: user.id, preco: parseFloat(preco), prazo: parseInt(prazo) || 7 })
    setPreco('')
    setPrazo('')
    setSending(false)
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
  if (!leilao) return <p className="text-gray-400">Leilao nao encontrado</p>

  const margem = preco ? ((leilao.preco_teto - parseFloat(preco)) / leilao.preco_teto * 100) : 0
  const valorTotal = preco ? parseFloat(preco) * leilao.volume : 0
  const posicaoEstimada = preco ? lances.filter(l => l.preco < parseFloat(preco)).length + 1 : lances.length + 1

  return (
    <div>
      <div className="text-sm text-gray-400 mb-1">
        <Link href="/distribuidora/leiloes" className="hover:text-[#E8621A]">Leiloes</Link>
        <span className="mx-1.5 text-gray-300">/</span>
        <span className="text-gray-700 font-medium">{leilao.combustivel}</span>
      </div>

      {/* Posto info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <p className="font-semibold text-gray-900">{leilao.posto?.nome}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {leilao.posto?.score && <><Stars rating={leilao.posto.score} /><span className="text-xs text-gray-400">{leilao.posto.score.toFixed(1)}</span></>}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">{leilao.posto?.cidade}/{leilao.posto?.estado}</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={leilao.status} />
          {leilao.status === 'aberto' && <Countdown endDate={leilao.deadline} />}
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Volume', value: `${leilao.volume?.toLocaleString()} L` },
          { label: 'Preco Teto', value: `R$ ${leilao.preco_teto?.toFixed(2)}/L` },
          { label: 'Prazo', value: `${leilao.prazo_entrega} dias` },
          { label: 'Pagamento', value: leilao.forma_pagamento },
        ].map(info => (
          <div key={info.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-400">{info.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{info.value}</p>
          </div>
        ))}
      </div>

      {/* Lance form */}
      {leilao.status === 'aberto' && (
        <div className="bg-gradient-to-br from-[#FFF1E8] to-white rounded-2xl border border-[#E8621A]/10 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enviar Proposta</h3>
          <form onSubmit={enviarLance} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Preco por Litro</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                  <input type="number" step="0.001" value={preco} onChange={e => setPreco(e.target.value)} required placeholder="5.58" className="w-full h-11 rounded-xl border-gray-200 pl-9 pr-4 focus:border-[#E8621A] focus:ring-2 focus:ring-[#E8621A]/10 outline-none transition-all border" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Prazo de Entrega</label>
                <div className="relative">
                  <input type="number" min="1" max="90" value={prazo} onChange={e => setPrazo(e.target.value)} required placeholder="5" className="w-full h-11 rounded-xl border-gray-200 pl-4 pr-12 focus:border-[#E8621A] focus:ring-2 focus:ring-[#E8621A]/10 outline-none transition-all border" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">dias</span>
                </div>
              </div>
            </div>

            {preco && (
              <div className="bg-white rounded-xl border border-gray-100 p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400">Valor Total</p>
                  <p className="text-2xl font-bold text-[#E8621A]">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Economia vs Teto</p>
                  <p className={`text-2xl font-bold ${margem > 0 ? 'text-green-600' : 'text-red-500'}`}>{margem.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Posicao Estimada</p>
                  <p className="text-2xl font-bold text-gray-900">{posicaoEstimada}o</p>
                </div>
              </div>
            )}

            <button type="submit" disabled={sending} className="w-full h-12 bg-[#E8621A] hover:bg-[#C44E10] text-white font-semibold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]">
              {sending ? 'Enviando...' : 'Enviar Proposta'}
            </button>
          </form>
        </div>
      )}

      {/* Ranking */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Ranking de Propostas</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-gray-400">Tempo real</span>
        </div>
      </div>

      {lances.length === 0 ? (
        <div className="flex flex-col items-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-lg font-medium text-gray-400">Nenhuma proposta ainda</p>
          <p className="text-sm text-gray-300">Seja o primeiro a enviar!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lances.map((lance, i) => {
            const isMe = lance.dist_id === userId
            return (
              <div key={lance.id} className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-md ${isMe ? 'border-[#E8621A]/30 bg-[#FFF1E8]/30' : i === 0 ? 'border-green-200' : 'border-gray-100'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-[#E8621A] text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{lance.distribuidora?.nome || 'Distribuidora'}</p>
                      {isMe && <span className="bg-[#FFF1E8] text-[#E8621A] text-[10px] font-semibold px-2 py-0.5 rounded-full">Seu lance</span>}
                      {i === 0 && <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">Melhor</span>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Prazo: {lance.prazo} dias</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${i === 0 ? 'text-[#E8621A]' : 'text-gray-900'}`}>R$ {lance.preco?.toFixed(3)}</p>
                    <p className="text-xs text-gray-400">{((leilao.preco_teto - lance.preco) / leilao.preco_teto * 100).toFixed(1)}% abaixo</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
