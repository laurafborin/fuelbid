'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NovoLeilao() {
  const [combustivel, setCombustivel] = useState('Gasolina Comum')
  const [volume, setVolume] = useState('')
  const [precoTeto, setPrecoTeto] = useState('')
  const [prazoEntrega, setPrazoEntrega] = useState('')
  const [duracao, setDuracao] = useState('24')
  const [regiao, setRegiao] = useState('São Paulo - Capital')
  const [pagamento, setPagamento] = useState('PIX')
  const [tipoCompra, setTipoCompra] = useState('spot')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const now = new Date()
    const deadline = new Date(now.getTime() + parseInt(duracao) * 3600000)

    const { error } = await supabase.from('leiloes').insert({
      posto_id: user.id,
      combustivel,
      volume: parseInt(volume),
      preco_teto: parseFloat(precoTeto),
      prazo_entrega: prazoEntrega,
      regiao,
      forma_pagamento: pagamento,
      tipo_compra: tipoCompra,
      status: 'aberto',
      deadline: deadline.toISOString(),
    })

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    router.push('/posto/dashboard')
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Novo Leilao</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Combustivel</label>
          <select value={combustivel} onChange={e => setCombustivel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand">
            <option>Gasolina Comum</option>
            <option>Gasolina Aditivada</option>
            <option>Etanol</option>
            <option>Diesel S10</option>
            <option>Diesel S500</option>
            <option>GNV</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Volume (litros)</label>
            <input type="number" value={volume} onChange={e => setVolume(e.target.value)} required min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preco Teto (R$/L)</label>
            <input type="number" step="0.01" value={precoTeto} onChange={e => setPrecoTeto(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Entrega</label>
            <input type="date" value={prazoEntrega} onChange={e => setPrazoEntrega(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duracao do Leilao (horas)</label>
            <select value={duracao} onChange={e => setDuracao(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand">
              <option value="6">6 horas</option>
              <option value="12">12 horas</option>
              <option value="24">24 horas</option>
              <option value="48">48 horas</option>
              <option value="72">72 horas</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Regiao</label>
          <select value={regiao} onChange={e => setRegiao(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand">
            <option>São Paulo - Capital</option>
            <option>São Paulo - Interior</option>
            <option>Rio de Janeiro</option>
            <option>Minas Gerais</option>
            <option>Parana</option>
            <option>Santa Catarina</option>
            <option>Rio Grande do Sul</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
            <select value={pagamento} onChange={e => setPagamento(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand">
              <option>PIX</option>
              <option>Boleto</option>
              <option>Transferencia</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Compra</label>
            <select value={tipoCompra} onChange={e => setTipoCompra(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-brand">
              <option value="spot">Spot (unica)</option>
              <option value="recorrente">Recorrente</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50">
          {loading ? 'Criando...' : 'Publicar Leilao'}
        </button>
      </form>
    </div>
  )
}
