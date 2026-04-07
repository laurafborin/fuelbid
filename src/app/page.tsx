'use client'

import Link from 'next/link'
import { useState } from 'react'

const features = [
  {
    title: 'Leilão Reverso',
    desc: 'Distribuidoras competem pelo menor preço. Postos escolhem a melhor oferta em tempo real.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
  },
  {
    title: 'Mapa Logístico',
    desc: 'Visualize distribuidoras por região e otimize rotas de entrega automaticamente.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: 'Sistema de Reputação',
    desc: 'Score e avaliações garantem confiança entre postos e distribuidoras.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'Contratos Digitais',
    desc: 'Assinatura digital com hash SHA-256 e verificação de integridade automática.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Pagamento Integrado',
    desc: 'PIX, boleto e carteira digital. Liquidação rápida com rastreabilidade completa.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Compliance Fiscal',
    desc: 'NF-e automática com ICMS, PIS e COFINS. Chave de 44 dígitos e documentação ANP.',
    icon: (
      <svg className="w-6 h-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
]

const stats = [
  { value: '43 mil+', label: 'Postos no Brasil' },
  { value: 'R$ 770bi+', label: 'Mercado anual' },
  { value: '40%', label: 'Bandeira branca' },
  { value: '133bi L', label: 'Volume 2024' },
]

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)

  async function handleSetup() {
    setSetupLoading(true)
    try {
      const res = await fetch('/api/setup-profiles', { method: 'POST' })
      const data = await res.json()
      alert(data.message || data.error || 'Pronto!')
    } catch {
      alert('Erro ao configurar perfis')
    } finally {
      setSetupLoading(false)
    }
  }

  async function handleSeed() {
    setLoading(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      alert(data.message || data.error || 'Pronto!')
    } catch {
      alert('Erro ao carregar dados demo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center text-white font-black text-lg">F</div>
          <span className="text-xl font-bold text-gray-900">FuelBid</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
            Entrar
          </Link>
          <Link href="/cadastro" className="px-5 py-2.5 text-sm bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors">
            Criar Conta
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center max-w-4xl mx-auto">
        <span className="bg-[#FFF1E8] text-brand rounded-full px-4 py-1.5 text-sm font-medium">
          Marketplace B2B de Combustíveis
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mt-6">
          O leilão reverso que dá poder aos{' '}
          <span className="text-brand">postos independentes</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mt-6 leading-relaxed">
          Distribuidoras competem pelo seu volume. Você escolhe a melhor oferta.
          Contratos digitais, NF-e automática e pagamento via PIX.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/cadastro" className="px-8 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors text-base">
            Começar Agora
          </Link>
          <Link href="/login" className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-brand hover:text-brand transition-colors text-base">
            Ver Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-8 py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">Como funciona</h2>
          <p className="text-center text-gray-500 mb-12">Tecnologia que transforma a cadeia de distribuição de combustíveis</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-8 bg-white rounded-2xl border border-gray-100 hover:border-brand/20 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-12">O mercado que estamos transformando</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="p-6">
                <p className="text-3xl md:text-4xl font-extrabold text-brand">{s.value}</p>
                <p className="mt-2 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center px-6">
        <p className="text-gray-400 text-sm max-w-2xl mx-auto">
          FuelBid © 2025 — Trabalho de Conclusão de Curso — Escola de Administração de Empresas de São Paulo — Fundação Getulio Vargas (FGV-EAESP) — Isabela Peres Pereira Hildebrandt Garcia, Laura Ferreira Borin, Letícia Gabriel Ferreira Dias
        </p>
        <Link href="/sobre" className="text-gray-300 hover:text-gray-500 text-xs transition-colors mt-2 inline-block">Sobre o Projeto</Link>
        <div className="mt-3 flex gap-3 justify-center">
          <button
            onClick={handleSetup}
            disabled={setupLoading}
            className="text-gray-300 hover:text-gray-500 text-xs transition-colors disabled:opacity-50"
          >
            {setupLoading ? 'Configurando...' : 'Configurar Perfis'}
          </button>
          <span className="text-gray-200">•</span>
          <button
            onClick={handleSeed}
            disabled={loading}
            className="text-gray-300 hover:text-gray-500 text-xs transition-colors disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Carregar Dados Demo'}
          </button>
        </div>
      </footer>
    </div>
  )
}
