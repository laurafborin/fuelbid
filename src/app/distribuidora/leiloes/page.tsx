'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Leilao } from '@/lib/types'
import Countdown from '@/components/Countdown'
import StatusBadge from '@/components/StatusBadge'
import Link from 'next/link'

export default function LeiloesDistribuidoraPage() {
  const [leiloes, setLeiloes] = useState<Leilao[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('leiloes')
        .select('*, posto:profiles(*)')
        .eq('status', 'aberto')
        .order('created_at', { ascending: false })
      setLeiloes(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-gray-500">Carregando...</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Todos os Leilões Abertos</h1>
      {leiloes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500">Nenhum leilão aberto no momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leiloes.map((l) => (
            <div key={l.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{l.combustivel}</h3>
                  <p className="text-xs text-gray-500">{l.posto?.nome} • {l.regiao}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                <div><span className="text-gray-500 text-xs">Volume</span><p className="font-medium">{l.volume_litros?.toLocaleString()}L</p></div>
                <div><span className="text-gray-500 text-xs">Teto</span><p className="font-medium">R$ {l.preco_teto?.toFixed(2)}</p></div>
                <div><span className="text-gray-500 text-xs">Tempo</span><p><Countdown endDate={l.end_time} /></p></div>
              </div>
              <Link href={`/distribuidora/leilao/${l.id}`} className="block text-center py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-dark">
                Dar Lance
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
