'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import Stars from '@/components/Stars'

export default function PerfilPostoPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-gray-500">Carregando...</p>
  if (!profile) return <p className="text-gray-500">Perfil não encontrado</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center text-2xl">🏪</div>
          <div>
            <h2 className="text-xl font-bold">{profile.nome}</h2>
            <p className="text-sm text-gray-500">{profile.tipo === 'posto' ? 'Posto de Combustível' : 'Distribuidora'}</p>
            <Stars rating={profile.score} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Tipo</span><p className="font-medium capitalize">{profile.tipo}</p></div>
          <div><span className="text-gray-500">CNPJ</span><p className="font-medium">{profile.cnpj}</p></div>
          <div><span className="text-gray-500">Telefone</span><p className="font-medium">{profile.telefone}</p></div>
          <div><span className="text-gray-500">Score</span><p className="font-medium">{profile.score?.toFixed(1)}</p></div>
          <div className="col-span-2"><span className="text-gray-500">Localização</span><p className="font-medium">{profile.cidade}/{profile.estado}</p></div>
        </div>
      </div>
    </div>
  )
}
