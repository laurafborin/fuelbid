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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro(error.message)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('tipo')
      .eq('id', data.user.id)
      .single()

    if (profile?.tipo === 'distribuidora') {
      router.push('/distribuidora/dashboard')
    } else {
      router.push('/posto/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto">F</div>
        <h1 className="text-xl font-bold text-center mt-4 text-gray-900">Entrar no FuelBid</h1>
        <p className="text-sm text-center text-gray-500 mt-1">Marketplace B2B de Combustíveis</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-6">
          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl">{erro}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                placeholder="••••••"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all placeholder:text-gray-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark disabled:opacity-50 transition-colors"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">ou</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="bg-[#FFF1E8] rounded-xl p-4 text-sm space-y-1.5">
            <p className="text-xs font-semibold text-brand mb-2">Credenciais Demo</p>
            <p className="text-xs text-gray-600"><span className="font-medium">Posto:</span> posto@fuelbid.com / 123456</p>
            <p className="text-xs text-gray-600"><span className="font-medium">Distribuidora:</span> distribuidora@fuelbid.com / 123456</p>
          </div>
        </div>

        <div className="flex justify-between mt-5 text-sm">
          <Link href="/" className="text-gray-400 hover:text-gray-600 transition-colors">← Voltar</Link>
          <Link href="/cadastro" className="text-brand font-medium hover:underline">Criar conta</Link>
        </div>
      </div>
    </div>
  )
}
