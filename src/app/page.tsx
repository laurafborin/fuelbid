'use client'

import Link from 'next/link'
import { useState } from 'react'

const features = [
  { title: 'Leilão Reverso', desc: 'Distribuidoras competem pelo menor preço. Você escolhe a melhor oferta.', icon: '⬇' },
  { title: 'Contratos Digitais', desc: 'Assinatura digital com hash SHA-256 e validade jurídica.', icon: '📄' },
  { title: 'NF-e Automática', desc: 'Geração automática com ICMS, PIS e COFINS calculados.', icon: '🧾' },
  { title: 'Pagamento via PIX', desc: 'QR Code PIX integrado para liquidação rápida.', icon: '💰' },
  { title: 'Ranking & Reputação', desc: 'Sistema de avaliação com score e estrelas.', icon: '⭐' },
  { title: 'Analytics em Tempo Real', desc: 'KPIs, market share e insights para decisões estratégicas.', icon: '📊' },
]

export default function Home() {
  const [loading, setLoading] = useState(false)

  async function handleSeed() {
    setLoading(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      alert(data.message || 'Dados demo carregados!')
    } catch {
      alert('Erro ao carregar dados demo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-xl">F</span>
          <span className="text-xl font-bold text-gray-900">FuelBid</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="px-4 py-2 text-sm border border-brand text-brand rounded-lg hover:bg-brand/5 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Carregar Demo'}
          </button>
          <Link href="/login" className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
            Entrar
          </Link>
          <Link href="/cadastro" className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand-dark">
            Criar Conta
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-3xl leading-tight">
          O leilão reverso que dá poder aos{' '}
          <span className="text-brand">postos independentes</span>
        </h1>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl">
          Marketplace B2B de combustíveis. Distribuidoras competem, postos economizam.
          Contratos digitais, NF-e automática e pagamento via PIX.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/cadastro" className="px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark">
            Começar Agora
          </Link>
          <Link href="/login" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50">
            Já tenho conta
          </Link>
        </div>
      </section>

      <section className="px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-200 px-6 py-8 text-center text-sm text-gray-500">
        FuelBid © 2025 — TCC Laura Borin, Isabela Garcia, Letícia Dias — FGV-EAESP
      </footer>
    </div>
  )
}
