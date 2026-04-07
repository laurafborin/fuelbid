'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Contrato } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import SignaturePad from '@/components/SignaturePad'
import Link from 'next/link'

export default function ContratoDistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const q = '*, posto:profiles!contratos_posto_id_fkey(*), leilao:leiloes(*), lance:lances(*, distribuidora:profiles!lances_dist_id_fkey(*))'

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('contratos').select(q).eq('id', id).single()
      setContrato(data)
      setLoading(false)
    }
    load()
  }, [id])

  async function handleAssinar(dataUrl: string) {
    if (!contrato) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const isPosto = user.id === contrato.posto_id
    const field = isPosto ? 'assinatura_posto' : 'assinatura_dist'
    const timeField = isPosto ? 'assinado_posto_em' : 'assinado_dist_em'
    const otherSigned = isPosto ? contrato.assinatura_dist : contrato.assinatura_posto
    const updates: Record<string, string> = { [field]: dataUrl, [timeField]: new Date().toISOString() }
    if (otherSigned) updates.status = 'assinado'
    else updates.status = isPosto ? 'assinado_posto' : 'assinado_distribuidora'
    await supabase.from('contratos').update(updates).eq('id', id)
    if (updates.status === 'assinado') {
      await supabase.from('pagamentos').insert({ contrato_id: id, valor: contrato.valor, status: 'pendente', metodo: 'pix' })
    }
    const { data: updated } = await supabase.from('contratos').select(q).eq('id', id).single()
    setContrato(updated)
    alert('Assinatura registrada!')
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>
  if (!contrato) return <p className="text-gray-400">Contrato nao encontrado</p>

  const clausulas = contrato.clausulas || [
    'Fornecimento conforme especificacoes ANP.',
    `Volume: ${contrato.leilao?.volume?.toLocaleString()} litros.`,
    `Preco: R$ ${contrato.lance?.preco?.toFixed(3)}/L. Total: R$ ${contrato.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
    'Pagamento via PIX apos entrega.',
    'Termos da plataforma FuelBid.',
  ]

  return (
    <div className="max-w-3xl">
      <div className="text-sm text-gray-400 mb-1">
        <Link href="/distribuidora/contratos" className="hover:text-[#E8621A]">Contratos</Link>
        <span className="mx-1.5 text-gray-300">/</span>
        <span className="text-gray-700 font-medium">Detalhe</span>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="bg-gray-100 text-gray-600 rounded-lg px-3 py-1 text-xs font-mono">CT-{id.slice(0, 8).toUpperCase()}</span>
        <h1 className="text-2xl font-bold text-gray-900">Contrato de Fornecimento</h1>
        <StatusBadge status={contrato.status} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="pr-6 border-r border-gray-100">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Comprador</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">{contrato.posto?.nome}</p>
            <p className="text-sm text-gray-500 font-mono">{contrato.posto?.cnpj || '—'}</p>
            <p className="text-sm text-gray-400">{contrato.posto?.cidade}/{contrato.posto?.estado}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Vendedor</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">{contrato.lance?.distribuidora?.nome}</p>
            <p className="text-sm text-gray-500 font-mono">{contrato.lance?.distribuidora?.cnpj || '—'}</p>
            <p className="text-sm text-gray-400">{contrato.lance?.distribuidora?.cidade}/{contrato.lance?.distribuidora?.estado}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Objeto</p>
        <div className="grid grid-cols-3 gap-6">
          <div><p className="text-xs text-gray-400">Produto</p><p className="text-base font-semibold">{contrato.leilao?.combustivel}</p></div>
          <div><p className="text-xs text-gray-400">Volume</p><p className="text-base font-semibold">{contrato.leilao?.volume?.toLocaleString()} L</p></div>
          <div><p className="text-xs text-gray-400">Valor Total</p><p className="text-xl font-bold text-[#E8621A]">R$ {contrato.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Clausulas</p>
        {(clausulas as string[]).map((c: string, i: number) => (
          <div key={i} className="flex gap-3 py-3 border-b border-gray-50 last:border-0">
            <span className="text-[#E8621A] font-mono font-bold text-sm min-w-[24px]">{i + 1}.</span>
            <p className="text-sm text-gray-700 leading-relaxed">{c}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Assinaturas</p>
        <div className="grid grid-cols-2 gap-6">
          {(['posto', 'dist'] as const).map(lado => {
            const signed = lado === 'posto' ? contrato.assinatura_posto : contrato.assinatura_dist
            const time = lado === 'posto' ? contrato.assinado_posto_em : contrato.assinado_dist_em
            return (
              <div key={lado} className="border border-gray-100 rounded-xl p-6 text-center">
                <p className="text-xs text-gray-500 mb-3">{lado === 'posto' ? 'Comprador' : 'Vendedor'}</p>
                {signed ? (
                  <>
                    <svg width="32" height="32" className="mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm font-medium text-green-700 mt-2">Assinado</p>
                    {time && <p className="text-xs text-gray-400">{new Date(time).toLocaleDateString('pt-BR')}</p>}
                  </>
                ) : (
                  <>
                    <svg width="32" height="32" className="mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-sm text-gray-400 italic mt-2">Aguardando</p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {contrato.status !== 'assinado' && contrato.status !== 'concluido' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
          <p className="font-semibold text-sm mb-3">Assinar Contrato</p>
          <SignaturePad onSave={handleAssinar} />
        </div>
      )}

      {contrato.hash_contrato && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-400">SHA-256</p>
          <p className="font-mono text-xs text-gray-500 break-all mt-1">{contrato.hash_contrato}</p>
        </div>
      )}
    </div>
  )
}
