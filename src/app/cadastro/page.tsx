'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CadastroPage() {
  const [tipo, setTipo] = useState<'posto' | 'distribuidora'>('posto')
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password: senha })

    if (error) {
      setErro(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        tipo,
        nome,
        cnpj,
        telefone,
        cidade,
        estado,
        lat: -23.55 + Math.random() * 0.1,
        lng: -46.63 + Math.random() * 0.1,
        score: 5.0,
      })

      if (profileError) {
        setErro(profileError.message)
        setLoading(false)
        return
      }

      router.push(tipo === 'distribuidora' ? '/distribuidora/dashboard' : '/posto/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-xl">F</span>
          <span className="text-xl font-bold text-gray-900">FuelBid</span>
        </Link>

        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Criar Conta</h1>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg">{erro}</div>
          )}

          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de conta</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipo('posto')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                    tipo === 'posto'
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  🏪 Posto de Combustível
                </button>
                <button
                  type="button"
                  onClick={() => setTipo('distribuidora')}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                    tipo === 'distribuidora'
                      ? 'border-brand bg-brand/5 text-brand'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  🚛 Distribuidora
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input type="text" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} maxLength={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand text-white rounded-lg font-semibold hover:bg-brand-dark disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
