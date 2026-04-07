'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Nfe } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'

export default function NfesDistPage() {
  const [nfes, setNfes] = useState<Nfe[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: contratos } = await supabase.from('contratos').select('id').eq('dist_id', user.id)
      if (!contratos?.length) { setLoading(false); return }
      const { data } = await supabase.from('nfes').select('*').in('contrato_id', contratos.map(c => c.id)).order('created_at', { ascending: false })
      setNfes(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notas Fiscais Eletronicas</h1>
      {nfes.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
          <svg width="48" height="48" className="text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
          <p className="text-lg font-medium text-gray-400 mt-4">Nenhuma nota fiscal emitida</p>
          <p className="text-sm text-gray-300">NF-es sao geradas automaticamente apos confirmacao do pagamento</p>
        </div>
      ) : (
        <div className="space-y-6">
          {nfes.map(nf => {
            const valorLiquido = nf.valor_total - nf.icms - nf.pis - nf.cofins
            return (
              <div key={nf.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-100">
                  <div><span className="text-xs text-gray-400">NF-e</span><p className="text-lg font-bold font-mono">#{String(nf.numero || '').padStart(6, '0')}</p></div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={nf.status || 'emitida'} />
                    {nf.data_emissao && <span className="text-xs text-gray-400">{new Date(nf.data_emissao).toLocaleDateString('pt-BR')}</span>}
                  </div>
                </div>
                <div className="px-6 py-5">
                  <div className="grid grid-cols-2 gap-6 mb-5 pb-5 border-b border-gray-100">
                    <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Emitente</p><p className="text-sm font-semibold mt-1">{nf.emitente}</p></div>
                    <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Destinatario</p><p className="text-sm font-semibold mt-1">{nf.destinatario}</p></div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-100">
                    <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Produto</p><p className="text-sm font-semibold mt-1">{nf.combustivel}</p></div>
                    <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Volume</p><p className="text-sm font-semibold mt-1">{nf.volume?.toLocaleString()} L</p></div>
                    <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Preco/L</p><p className="text-sm font-semibold mt-1">R$ {(nf.valor_total / (nf.volume || 1)).toFixed(3)}</p></div>
                    <div><p className="text-[10px] uppercase tracking-widest text-gray-400">Valor Total</p><p className="text-sm font-bold text-[#E8621A] mt-1">R$ {nf.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Tributos</p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      <div><p className="text-[10px] text-gray-400">Base</p><p className="text-sm font-semibold">R$ {nf.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                      <div><p className="text-[10px] text-gray-400">ICMS 18%</p><p className="text-sm font-semibold text-red-600">R$ {nf.icms?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                      <div><p className="text-[10px] text-gray-400">PIS 1,65%</p><p className="text-sm font-semibold">R$ {nf.pis?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                      <div><p className="text-[10px] text-gray-400">COFINS 7,6%</p><p className="text-sm font-semibold">R$ {nf.cofins?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                      <div><p className="text-[10px] text-gray-400">CIDE 1%</p><p className="text-sm font-semibold">R$ {(nf.valor_total * 0.01)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                      <div><p className="text-[10px] text-gray-400">Liquido</p><p className="text-sm font-semibold text-green-700">R$ {valorLiquido?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">Chave de Acesso</p>
                  <p className="font-mono text-[11px] text-gray-500 tracking-wide break-all">{nf.chave_acesso}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
