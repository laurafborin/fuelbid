'use client'

import Link from 'next/link'
import { useState } from 'react'

const features = [
  {
    title: 'Leilão Reverso',
    desc: 'Postos publicam sua demanda de combustível. Distribuidoras competem em tempo real pelo menor preço, garantindo as melhores condições.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>,
  },
  {
    title: 'Mapa Logístico',
    desc: 'Visualize demandas por região, otimize rotas de entrega e aproveite cargas compartilhadas para reduzir custos de frete.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    title: 'Reputação',
    desc: 'Sistema de avaliação bidirecional. Score dinâmico baseado em preço, prazo, qualidade e confiabilidade de cada negociação.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  },
  {
    title: 'Contratos Digitais',
    desc: 'Geração automática de contratos com cláusulas baseadas no leilão. Assinatura digital e versionamento para ambas as partes.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    title: 'Pagamento Integrado',
    desc: 'PIX, boleto e carteira digital com modelo escrow. O valor é liberado apenas após confirmação da entrega.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    title: 'Compliance Fiscal',
    desc: 'NF-e emitida automaticamente com ICMS, PIS, COFINS e documentação ANP. Transparência total para o fisco.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  },
]

const stats = [
  { value: '43.000+', label: 'Postos no Brasil' },
  { value: 'R$ 770 bi', label: 'Mercado anual' },
  { value: '40%', label: 'Bandeira branca' },
  { value: '133 bi L', label: 'Volume em 2024' },
]

export default function Home() {
  const [seedLoading, setSeedLoading] = useState(false)

  async function handleSeed() {
    setSeedLoading(true)
    try {
      await fetch('/api/setup-profiles', { method: 'POST' })
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      alert(data.message || data.error || 'Pronto!')
    } catch { alert('Erro ao carregar dados demo') }
    finally { setSeedLoading(false) }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8621A] flex items-center justify-center text-white font-black text-lg">T</div>
            <span className="text-xl font-bold text-gray-900">Tan<span className="text-[#E8621A]">qe</span></span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/sobre" className="text-sm text-gray-500 hover:text-gray-900 hidden sm:inline">Sobre</Link>
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-[#E8621A]">Entrar</Link>
            <Link href="/cadastro" className="bg-[#E8621A] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#C44E10] transition-colors">Criar Conta</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-[#FFF1E8] text-[#E8621A] rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            Digitalizando a Revenda de Combustíveis
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            O leilão reverso que<br />
            empodera os<br />
            <span className="text-[#E8621A]">postos independentes</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Conectamos postos de bandeira branca a distribuidoras através de leilões reversos com cotação em tempo real, contratos digitais e compliance fiscal integrado.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/cadastro" className="bg-[#E8621A] text-white font-semibold px-8 py-3.5 rounded-xl text-base hover:bg-[#C44E10] transition-all hover:shadow-lg hover:shadow-[#E8621A]/20">
              Começar Agora
            </Link>
            <Link href="/login" className="bg-white text-gray-700 font-semibold px-8 py-3.5 rounded-xl text-base border border-gray-200 hover:border-[#E8621A] hover:text-[#E8621A] transition-all">
              Ver Demonstração
            </Link>
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-20 border-y border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl md:text-4xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Como funciona</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Tecnologia que transforma a cadeia de distribuição de combustíveis no Brasil</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl hover:border-[#E8621A]/10 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF1E8] group-hover:bg-[#E8621A] transition-colors duration-300 flex items-center justify-center mb-5 text-[#E8621A] group-hover:text-white">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-[#E8621A] flex items-center justify-center text-white font-black text-sm">T</div>
                <span className="text-lg font-bold text-gray-900">Tan<span className="text-[#E8621A]">qe</span></span>
              </div>
              <p className="text-sm text-gray-400 mt-2">Marketplace B2B de combustíveis com leilão reverso.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Plataforma</h4>
              <div className="space-y-2">
                <Link href="/sobre" className="block text-sm text-gray-400 hover:text-[#E8621A]">Sobre o Projeto</Link>
                <Link href="/login" className="block text-sm text-gray-400 hover:text-[#E8621A]">Para Postos</Link>
                <Link href="/login" className="block text-sm text-gray-400 hover:text-[#E8621A]">Para Distribuidoras</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">TCC FGV-EAESP</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Isabela Peres P. H. Garcia</p>
                <p>Laura Ferreira Borin</p>
                <p>Letícia Gabriel F. Dias</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-gray-300">© 2025 Tanqe. Todos os direitos reservados.</p>
            <button onClick={handleSeed} disabled={seedLoading} className="text-xs text-gray-300 hover:text-gray-500 transition-colors disabled:opacity-50">
              {seedLoading ? 'Carregando...' : 'Carregar Dados Demo'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
