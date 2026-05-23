'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Pagamento } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import Link from 'next/link'

export default function PagamentosPostoPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [metodo, setMetodo] = useState('pix')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('pagamentos')
        .select('*, contrato:contratos(*, leilao:leiloes(*), lance:lances(*, distribuidora:profiles!lances_dist_id_fkey(*)))')
        .order('created_at', { ascending: false })
      setPagamentos((data || []).filter((p: Pagamento) => p.contrato?.posto_id === user.id))
      setLoading(false)
    }
    load()
  }, [])

  async function confirmar(p: Pagamento) {
    await supabase.from('pagamentos').update({ status: 'pago', pago_em: new Date().toISOString() }).eq('id', p.id)
    if (p.contrato) {
      const c = p.contrato
      const chave = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('')
      const { data: distPf } = await supabase.from('lances').select('distribuidora:profiles!lances_dist_id_fkey(nome)').eq('id', c.lance_id).single()
      const { data: postoPf } = await supabase.from('profiles').select('nome').eq('id', c.posto_id).single()
      await supabase.from('nfes').insert({
        contrato_id: c.id, numero: Math.floor(Math.random() * 900000) + 100000, serie: 1,
        data_emissao: new Date().toISOString(), chave_acesso: chave, valor_total: c.valor,
        icms: c.valor * 0.18, pis: c.valor * 0.0165, cofins: c.valor * 0.076,
        emitente: (distPf?.distribuidora as unknown as { nome: string })?.nome || '', destinatario: postoPf?.nome || '',
        combustivel: c.leilao?.combustivel || '', volume: c.leilao?.volume || 0, status: 'emitida',
      })
      await supabase.from('contratos').update({ status: 'concluido' }).eq('id', c.id)
    }
    setPagamentos(prev => prev.map(x => x.id === p.id ? { ...x, status: 'pago' } : x))
    alert('Pagamento confirmado! NF-e emitida.')
  }

  if (loading) return <div className="space-y-4">{[1,2].map(i=><div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse"/>)}</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pagamentos</h1>
      {pagamentos.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
          <svg width="48" height="48" className="text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h5.25A2.25 2.25 0 0121 6v6zm0 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6" /></svg>
          <p className="text-lg font-medium text-gray-400 mt-4">Nenhum pagamento registrado</p>
          <p className="text-sm text-gray-300">Pagamentos aparecem apos a assinatura de contratos</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pagamentos.map(p => (
            <div key={p.id}>
              {p.status === 'pendente' ? (
                <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-8">
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-400">Valor a Pagar</p>
                    <p className="text-4xl font-bold text-gray-900 mt-1">R$ {p.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>

                  {/* QR Code */}
                  <div className="w-48 h-48 mx-auto mb-4 bg-gray-900 rounded-2xl p-3">
                    <div className="bg-white rounded-xl w-full h-full" style={{ backgroundImage: 'repeating-conic-gradient(#000 0% 25%, #fff 0% 50%)', backgroundSize: '12px 12px' }} />
                  </div>
                  <p className="text-sm text-gray-400 text-center">Escaneie o QR Code</p>

                  {/* PIX Key */}
                  <div className="mt-4">
                    <p className="text-xs text-gray-400">Chave PIX</p>
                    <div className="bg-gray-50 rounded-lg px-4 py-2 flex justify-between items-center mt-1">
                      <span className="text-sm font-mono text-gray-600">fuelbid@pagamentos.com.br</span>
                      <button onClick={() => { navigator.clipboard.writeText('fuelbid@pagamentos.com.br') }} className="text-xs text-[#E8621A] font-semibold">Copiar</button>
                    </div>
                  </div>

                  {/* Methods */}
                  <div className="flex gap-2 mt-6 justify-center">
                    {['pix', 'boleto', 'carteira'].map(m => (
                      <button key={m} onClick={() => setMetodo(m)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${metodo === m ? 'bg-[#E8621A] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{m}</button>
                    ))}
                  </div>

                  <button onClick={() => confirmar(p)} className="w-full h-12 bg-[#E8621A] hover:bg-[#C44E10] text-white font-semibold rounded-xl mt-8 transition-all active:scale-[0.98]">
                    Confirmar Pagamento
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <svg width="48" height="48" className="mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xl font-bold text-gray-900 mt-3">Pagamento Confirmado</p>
                  <p className="text-sm text-gray-400 mt-1">R$ {p.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm text-gray-400 mt-1">NF-e emitida automaticamente</p>
                  <Link href="/posto/nfes" className="text-[#E8621A] text-sm font-semibold mt-4 inline-block hover:underline">Ver Nota Fiscal</Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
