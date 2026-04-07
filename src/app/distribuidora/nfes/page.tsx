'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Nfe } from '@/lib/types'

export default function NfesDistribuidoraPage() {
  const [nfes, setNfes] = useState<Nfe[]>([])
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
        .eq('dist_id', user.id)

      if (!userLances || userLances.length === 0) {
        setLoading(false)
        return
      }

      const lanceIds = userLances.map(l => l.id)
      const { data: contratos } = await supabase
        .from('contratos')
        .select('id')
        .in('lance_id', lanceIds)

      if (!contratos || contratos.length === 0) { setLoading(false); return }
      const ids = contratos.map(c => c.id)
      const { data } = await supabase.from('nfes').select('*').in('contrato_id', ids).order('created_at', { ascending: false })
      setNfes(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-gray-500">Carregando...</p>

  const valorLiquido = (nf: Nfe) => nf.valor_total - nf.icms - nf.pis - nf.cofins

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Notas Fiscais Eletrônicas</h1>
      {nfes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">Nenhuma NF-e emitida</p>
        </div>
      ) : (
        <div className="space-y-4">
          {nfes.map((nf) => (
            <div key={nf.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold">{nf.combustivel} — {nf.volume?.toLocaleString()}L</p>
                  <p className="text-xs text-gray-500">Emitente: {nf.emitente} → Destinatario: {nf.destinatario}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Emitida</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div><span className="text-gray-500">Valor Total</span><p className="font-semibold">R$ {nf.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><span className="text-gray-500">ICMS (18%)</span><p className="font-semibold text-red-600">R$ {nf.icms?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><span className="text-gray-500">PIS (1,65%)</span><p className="font-semibold text-red-600">R$ {nf.pis?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><span className="text-gray-500">COFINS (7,6%)</span><p className="font-semibold text-red-600">R$ {nf.cofins?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                <div><span className="text-gray-500">Valor Liquido</span><p className="font-semibold text-green-700">R$ {valorLiquido(nf)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Chave de Acesso (44 digitos)</p>
                <p className="text-xs font-mono text-gray-700 break-all">{nf.chave_acesso}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
