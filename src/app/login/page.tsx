'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) { setErro(error.message); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('tipo').eq('id', data.user.id).single()
    router.push(profile?.tipo === 'distribuidora' ? '/distribuidora/dashboard' : '/posto/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#E8621A] to-[#C44E10] flex-col justify-center px-16 text-white">
        <h1 className="text-4xl font-bold leading-tight">Negocie combustíveis<br />com inteligência</h1>
        <p className="text-lg text-white/80 mt-4">A plataforma que conecta postos independentes às melhores distribuidoras do Brasil.</p>
        <div className="mt-12 space-y-6">
          {[
            { n: '1', t: 'Publique sua demanda', d: 'Defina combustível, volume e preço teto' },
            { n: '2', t: 'Receba propostas competitivas', d: 'Distribuidoras competem em tempo real' },
            { n: '3', t: 'Feche negócios com segurança', d: 'Contrato digital, PIX e NF-e automática' },
          ].map(s => (
            <div key={s.n} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">{s.n}</div>
              <div>
                <p className="font-semibold">{s.t}</p>
                <p className="text-sm text-white/70">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#F8F7F4]">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#E8621A] flex items-center justify-center text-white font-black text-xl">T</div>
            <span className="text-xl font-bold text-gray-900">Tan<span className="text-[#E8621A]">qe</span></span>
          </Link>

          <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta</h2>
          <p className="text-gray-500 text-sm mb-8">Acesse sua conta para gerenciar leilões e negociações.</p>

          {erro && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">{erro}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E8621A]/10 focus:border-[#E8621A] outline-none transition-all text-base placeholder:text-gray-300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} required placeholder="••••••" className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#E8621A]/10 focus:border-[#E8621A] outline-none transition-all text-base placeholder:text-gray-300" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 bg-[#E8621A] hover:bg-[#C44E10] text-white font-semibold rounded-xl text-base transition-all hover:shadow-lg hover:shadow-[#E8621A]/20 disabled:opacity-50 active:scale-[0.98]">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="border-t border-gray-100 mt-8 pt-6">
            <p className="text-sm text-gray-400 mb-3">Contas de demonstração:</p>
            <div className="bg-[#FFF1E8] rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">posto@fuelbid.com</span>
                <span className="text-xs bg-white rounded-lg px-2 py-1 text-gray-400 font-mono">123456</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">distribuidora@fuelbid.com</span>
                <span className="text-xs bg-white rounded-lg px-2 py-1 text-gray-400 font-mono">123456</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">← Voltar</Link>
            <Link href="/cadastro" className="text-[#E8621A] font-medium hover:underline">Criar conta</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
