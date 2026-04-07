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
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-xl">F</span>
          <span className="text-xl font-bold text-gray-900">FuelBid</span>
        </Link>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Entrar</h1>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{erro}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-brand font-medium hover:underline">Criar conta</Link>
          </p>
        </div>

        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Credenciais Demo</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Posto Shell Centro</span>
              <span className="font-mono">posto1@demo.com / demo123</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Posto Ipiranga Sul</span>
              <span className="font-mono">posto2@demo.com / demo123</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Distribuidora Alfa</span>
              <span className="font-mono">dist1@demo.com / demo123</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Distribuidora Beta</span>
              <span className="font-mono">dist2@demo.com / demo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
