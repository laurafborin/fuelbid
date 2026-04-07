'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NovoLeilao() {
  const [combustivel, setCombustivel] = useState('Gasolina Comum')
  const [volume, setVolume] = useState('')
  const [precoTeto, setPrecoTeto] = useState('')
  const [prazoEntrega, setPrazoEntrega] = useState('7')
  const [duracao, setDuracao] = useState('24')
  const [regiao, setRegiao] = useState('São Paulo - Capital')
  const [pagamento, setPagamento] = useState('PIX')
  const [tipoCompra, setTipoCompra] = useState('individual')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const valorMaxTotal = volume && precoTeto ? (parseInt(volume) * parseFloat(precoTeto)) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const deadline = new Date(Date.now() + parseInt(duracao) * 3600000)
    const { error } = await supabase.from('leiloes').insert({
      posto_id: user.id,
      combustivel,
      volume: parseInt(volume),
      preco_teto: parseFloat(precoTeto),
      prazo_entrega: parseInt(prazoEntrega) || 7,
      regiao,
      forma_pagamento: pagamento,
      tipo_compra: tipoCompra,
      status: 'aberto',
      deadline: deadline.toISOString(),
    })
    if (error) { alert(error.message); setLoading(false); return }
    router.push('/posto/dashboard')
  }

  const inputClass = 'w-full h-11 px-4 border border-gray-200 rounded-xl focus:border-[#E8621A] focus:ring-2 focus:ring-[#E8621A]/10 outline-none transition-all'

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar Novo Leilão</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-8 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Combustível</label>
          <select value={combustivel} onChange={e => setCombustivel(e.target.value)} className={inputClass}>
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Volume (litros)</label>
            <input type="number" value={volume} onChange={e => setVolume(e.target.value)} required min="1" placeholder="15000" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Preço Teto (R$/L)</label>
            <input type="number" step="0.01" value={precoTeto} onChange={e => setPrecoTeto(e.target.value)} required placeholder="5.89" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prazo de Entrega (dias)</label>
            <input type="number" min="1" max="90" value={prazoEntrega} onChange={e => setPrazoEntrega(e.target.value)} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Duração do Leilão</label>
            <select value={duracao} onChange={e => setDuracao(e.target.value)} className={inputClass}>
              <option value="6">6 horas</option>
              <option value="12">12 horas</option>
              <option value="24">24 horas</option>
              <option value="48">48 horas</option>
              <option value="72">72 horas</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Região</label>
          <select value={regiao} onChange={e => setRegiao(e.target.value)} className={inputClass}>
            <option>São Paulo - Capital</option>
            <option>São Paulo - Interior</option>
            <option>Rio de Janeiro</option>
            <option>Minas Gerais</option>
            <option>Paraná</option>
            <option>Santa Catarina</option>
            <option>Rio Grande do Sul</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Forma de Pagamento</label>
            <select value={pagamento} onChange={e => setPagamento(e.target.value)} className={inputClass}>
              <option>PIX</option>
              <option>Boleto</option>
              <option>Transferência</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de Compra</label>
            <select value={tipoCompra} onChange={e => setTipoCompra(e.target.value)} className={inputClass}>
              <option value="individual">Spot (única)</option>
              <option value="coletiva">Compra Coletiva</option>
            </select>
          </div>
        </div>

        {/* Resumo */}
        {volume && precoTeto && (
          <div className="bg-gradient-to-r from-[#FFF1E8] to-[#FEF3EC] rounded-2xl p-5 mt-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Resumo do Leilão</p>
            <div className="grid grid-cols-3 gap-4 text-sm mb-3">
              <div><span className="text-gray-500">Combustível</span><p className="font-medium">{combustivel}</p></div>
              <div><span className="text-gray-500">Volume</span><p className="font-medium">{parseInt(volume).toLocaleString()}L</p></div>
              <div><span className="text-gray-500">Região</span><p className="font-medium">{regiao}</p></div>
            </div>
            <div className="border-t border-[#E8621A]/10 pt-3">
              <span className="text-sm text-gray-500">Valor máximo total</span>
              <p className="text-2xl font-bold text-[#E8621A]">R$ {valorMaxTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full h-12 bg-[#E8621A] hover:bg-[#C44E10] text-white font-bold rounded-xl text-base transition-all hover:shadow-lg hover:shadow-[#E8621A]/20 disabled:opacity-50 active:scale-[0.98] mt-4">
          {loading ? 'Publicando...' : 'Publicar Leilão'}
        </button>
      </form>
    </div>
  )
}
