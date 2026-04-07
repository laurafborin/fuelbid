'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pagamento } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'

export default function PagamentosPostoPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('pagamentos')
        .select('*, contrato:contratos(*, leilao:leiloes(*), lance:lances(*, distribuidora:profiles!lances_dist_id_fkey(*)))')
        .eq('contrato.posto_id', user.id)
        .order('created_at', { ascending: false })
      setPagamentos((data || []).filter((p: Pagamento) => p.contrato))
      setLoading(false)
    }
    load()
  }, [])

  async function confirmar(pagamento: Pagamento) {
    await supabase.from('pagamentos').update({ status: 'confirmado' }).eq('id', pagamento.id)

    if (pagamento.contrato) {
      const c = pagamento.contrato
      const valorTotal = c.valor
      const icms = valorTotal * 0.18
      const pis = valorTotal * 0.0165
      const cofins = valorTotal * 0.076
      const chave = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('')

      const { data: postoPerfil } = await supabase.from('profiles').select('nome').eq('id', c.posto_id).single()

      // Get distribuidora name through the lance
      const { data: lanceData } = await supabase
        .from('lances')
        .select('dist_id, distribuidora:profiles!lances_dist_id_fkey(nome)')
        .eq('id', c.lance_id)
        .single()

      await supabase.from('nfes').insert({
        contrato_id: c.id,
        chave_acesso: chave,
        valor_total: valorTotal,
        icms,
        pis,
        cofins,
        emitente: (lanceData?.distribuidora as unknown as { nome: string } | null)?.nome || '',
        destinatario: postoPerfil?.nome || '',
        combustivel: c.leilao?.combustivel || '',
        volume: c.leilao?.volume || 0,
      })

      await supabase.from('contratos').update({ status: 'concluido' }).eq('id', c.id)
    }

    setPagamentos(prev => prev.map(p => p.id === pagamento.id ? { ...p, status: 'confirmado' } : p))
    alert('Pagamento confirmado! NF-e gerada automaticamente.')
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagamentos</h1>
      {pagamentos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">Nenhum pagamento pendente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pagamentos.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold">R$ {p.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-gray-500">{p.contrato?.leilao?.combustivel} - {p.contrato?.leilao?.volume?.toLocaleString()}L</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              {p.status === 'pendente' && (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-xs text-gray-500 mb-2">QR Code PIX (simulado)</p>
                    <div className="w-32 h-32 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="grid grid-cols-8 gap-0.5">
                        {Array.from({ length: 64 }).map((_, i) => (
                          <div key={i} className={`w-2.5 h-2.5 ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => confirmar(p)} className="w-full py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark">
                    Confirmar Pagamento
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
