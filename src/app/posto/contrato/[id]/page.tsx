'use client'

import { useEffect, useState } from 'react'
import { use } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Contrato } from '@/lib/types'
import StatusBadge from '@/components/StatusBadge'
import SignaturePad from '@/components/SignaturePad'

export default function ContratoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [contrato, setContrato] = useState<Contrato | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const selectQuery = '*, posto:profiles!contratos_posto_id_fkey(*), leilao:leiloes(*), lance:lances(*, distribuidora:profiles!lances_user_id_fkey(*))'

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('contratos')
        .select(selectQuery)
        .eq('id', id)
        .single()
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

    const updates: Record<string, string> = { [field]: dataUrl }

    const otherSigned = isPosto ? contrato.assinatura_dist : contrato.assinatura_posto
    if (otherSigned) {
      updates.status = 'assinado'
    } else {
      updates.status = isPosto ? 'assinado_posto' : 'assinado_distribuidora'
    }

    await supabase.from('contratos').update(updates).eq('id', id)

    if (updates.status === 'assinado') {
      await supabase.from('pagamentos').insert({
        contrato_id: id,
        valor: contrato.valor,
        status: 'pendente',
      })
    }

    const { data: updated } = await supabase.from('contratos')
      .select(selectQuery)
      .eq('id', id).single()
    setContrato(updated)
    alert('Assinatura salva!')
  }

  if (loading) return <p className="text-gray-500">Carregando...</p>
  if (!contrato) return <p className="text-gray-500">Contrato nao encontrado</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contrato</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <StatusBadge status={contrato.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Posto (Comprador)</p>
            <p className="font-semibold">{contrato.posto?.nome}</p>
            <p className="text-xs text-gray-500">{contrato.posto?.cnpj}</p>
            <p className="text-xs text-gray-500">{contrato.posto?.cidade}/{contrato.posto?.estado}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Distribuidora (Vendedor)</p>
            <p className="font-semibold">{contrato.lance?.distribuidora?.nome}</p>
            <p className="text-xs text-gray-500">{contrato.lance?.distribuidora?.cnpj}</p>
            <p className="text-xs text-gray-500">{contrato.lance?.distribuidora?.cidade}/{contrato.lance?.distribuidora?.estado}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-semibold mb-3">Clausulas</h3>
          <div className="text-sm text-gray-700 space-y-2">
            <p>1. O presente contrato refere-se a compra de <strong>{contrato.leilao?.volume?.toLocaleString()} litros</strong> de <strong>{contrato.leilao?.combustivel}</strong>.</p>
            <p>2. Preco acordado: <strong>R$ {contrato.lance?.preco?.toFixed(3)}/L</strong>, totalizando <strong>R$ {contrato.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.</p>
            <p>3. A entrega devera ser realizada conforme prazo estabelecido no leilao original.</p>
            <p>4. O pagamento sera efetuado via PIX apos assinatura de ambas as partes.</p>
            <p>5. Ambas as partes concordam com os termos e condicoes da plataforma FuelBid.</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <h3 className="font-semibold mb-3">Assinaturas</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Posto</p>
              {contrato.assinatura_posto ? (
                <img src={contrato.assinatura_posto} alt="Assinatura Posto" className="border rounded-lg h-[110px]" />
              ) : (
                <p className="text-xs text-gray-400">Pendente</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Distribuidora</p>
              {contrato.assinatura_dist ? (
                <img src={contrato.assinatura_dist} alt="Assinatura Distribuidora" className="border rounded-lg h-[110px]" />
              ) : (
                <p className="text-xs text-gray-400">Pendente</p>
              )}
            </div>
          </div>
        </div>

        {contrato.status !== 'assinado' && contrato.status !== 'concluido' && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold mb-3">Assinar Contrato</h3>
            <SignaturePad onSave={handleAssinar} />
          </div>
        )}
      </div>
    </div>
  )
}
