'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import Stars from '@/components/Stars'
import { SkeletonCard } from '@/components/Skeleton'

interface Avaliacao {
  id: string
  nota: number
  comentario: string
  created_at: string
  avaliador: { nome: string } | null
}

export default function PerfilPostoPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)

      const { data: avs } = await supabase
        .from('avaliacoes')
        .select('id, nota, comentario, created_at, avaliador:profiles!avaliacoes_avaliador_id_fkey(nome)')
        .eq('avaliado_id', user.id)
        .order('created_at', { ascending: false })
      setAvaliacoes((avs as unknown as Avaliacao[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="max-w-2xl space-y-4"><SkeletonCard /><SkeletonCard /></div>
  if (!profile) return <p className="text-gray-500">Perfil não encontrado</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Perfil</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#FFF1E8] rounded-full flex items-center justify-center text-2xl font-bold text-brand">
            {profile.nome?.charAt(0) || 'P'}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile.nome}</h2>
            <p className="text-sm text-gray-500">Posto de Combustível</p>
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={profile.score} />
              <span className="text-sm font-medium text-gray-600">{profile.score?.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">CNPJ</span><p className="font-medium">{profile.cnpj || '—'}</p></div>
          <div><span className="text-gray-500">Telefone</span><p className="font-medium">{profile.telefone || '—'}</p></div>
          <div><span className="text-gray-500">Score</span><p className="font-medium">{profile.score?.toFixed(1)}</p></div>
          <div><span className="text-gray-500">Localização</span><p className="font-medium">{profile.cidade}/{profile.estado}</p></div>
          {profile.bandeira && <div><span className="text-gray-500">Bandeira</span><p className="font-medium">{profile.bandeira}</p></div>}
          {profile.volume_mensal && <div><span className="text-gray-500">Volume Mensal</span><p className="font-medium">{profile.volume_mensal?.toLocaleString()} L</p></div>}
        </div>

        {profile.combustiveis && profile.combustiveis.length > 0 && (
          <div>
            <span className="text-sm text-gray-500">Combustíveis</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.combustiveis.map(c => (
                <span key={c} className="bg-[#FFF1E8] text-brand rounded-full px-3 py-1 text-xs font-semibold">{c}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avaliações */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Avaliações Recebidas</h2>
        {avaliacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white rounded-2xl border border-gray-100">
            <svg className="w-16 h-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-lg font-medium text-gray-400">Nenhuma avaliação recebida ainda</p>
            <p className="text-sm text-gray-300">Avaliações aparecem após a conclusão de negociações</p>
          </div>
        ) : (
          <div className="space-y-3">
            {avaliacoes.map((av) => (
              <div key={av.id} className="bg-white rounded-xl border border-gray-100 p-4 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-500">
                    {(av.avaliador as unknown as { nome: string })?.nome?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{(av.avaliador as unknown as { nome: string })?.nome || 'Anônimo'}</p>
                      <span className="text-xs text-gray-400">{new Date(av.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <Stars rating={av.nota} />
                    {av.comentario && <p className="text-sm text-gray-600 italic mt-1">{av.comentario}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
