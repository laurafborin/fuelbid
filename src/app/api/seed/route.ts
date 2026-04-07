import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  try {
    // Auth as posto to insert leiloes (RLS requires auth)
    const postoClient = createClient(url, key)
    const { data: postoAuth, error: postoAuthErr } = await postoClient.auth.signInWithPassword({
      email: 'posto@fuelbid.com', password: '123456',
    })
    if (postoAuthErr) throw new Error(`Auth posto: ${postoAuthErr.message}`)
    const postoId = postoAuth.user.id
    const { data: postoProfile } = await postoClient.from('profiles').select('nome').eq('id', postoId).single()

    // Auth as distribuidora to insert lances
    const distClient = createClient(url, key)
    const { data: distAuth, error: distAuthErr } = await distClient.auth.signInWithPassword({
      email: 'distribuidora@fuelbid.com', password: '123456',
    })
    if (distAuthErr) throw new Error(`Auth dist: ${distAuthErr.message}`)
    const distId = distAuth.user.id
    const { data: distProfile } = await distClient.from('profiles').select('nome').eq('id', distId).single()

    // Clean (order: FK dependencies)
    await postoClient.from('nfes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await postoClient.from('pagamentos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await postoClient.from('contratos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await distClient.from('lances').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await postoClient.from('leiloes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Leilões (as posto)
    const now = Date.now()
    const { data: leiloesData, error: leilaoErr } = await postoClient.from('leiloes').insert([
      {
        posto_id: postoId,
        combustivel: 'Diesel S10',
        volume: 15000,
        preco_teto: 5.89,
        prazo_entrega: 7,
        regiao: 'São Paulo - Capital',
        forma_pagamento: 'PIX',
        tipo_compra: 'individual',
        status: 'aberto',
        deadline: new Date(now + 3 * 3600000).toISOString(),
      },
      {
        posto_id: postoId,
        combustivel: 'Gasolina Comum',
        volume: 20000,
        preco_teto: 5.45,
        prazo_entrega: 10,
        regiao: 'São Paulo - Interior',
        forma_pagamento: 'Boleto',
        tipo_compra: 'individual',
        status: 'aberto',
        deadline: new Date(now + 24 * 3600000).toISOString(),
      },
    ]).select('id')
    if (leilaoErr) throw new Error(`Leilões: ${leilaoErr.message}`)

    const [l1, l2] = leiloesData!

    // Lances (as distribuidora)
    const { data: lancesData, error: lanceErr } = await distClient.from('lances').insert([
      { leilao_id: l1.id, dist_id: distId, preco: 5.72, prazo: 5, observacoes: 'Entrega em caminhão próprio' },
      { leilao_id: l1.id, dist_id: distId, preco: 5.65, prazo: 6, observacoes: 'Melhor preço garantido' },
      { leilao_id: l2.id, dist_id: distId, preco: 5.32, prazo: 8, observacoes: 'Terminal Paulínia' },
      { leilao_id: l2.id, dist_id: distId, preco: 5.38, prazo: 9, observacoes: 'Gasolina A premium' },
    ]).select('id')
    if (lanceErr) throw new Error(`Lances: ${lanceErr.message}`)

    // Contrato (as posto, accepting best lance on leilao 1) — omit status for DB default
    const valor = 5.65 * 15000
    const { data: contratoData, error: contratoErr } = await postoClient.from('contratos').insert([{
      leilao_id: l1.id,
      lance_id: lancesData![1].id,
      posto_id: postoId,
      dist_id: distId,
      valor,
    }]).select('id')
    if (contratoErr) throw new Error(`Contrato: ${contratoErr.message}`)

    // Pagamento
    const { error: pagErr } = await postoClient.from('pagamentos').insert([{
      contrato_id: contratoData![0].id,
      valor,
      status: 'pendente',
    }])
    if (pagErr) throw new Error(`Pagamento: ${pagErr.message}`)

    // NF-e
    const chave = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('')
    const { error: nfeErr } = await postoClient.from('nfes').insert([{
      contrato_id: contratoData![0].id,
      numero: Math.floor(Math.random() * 900000) + 100000,
      serie: 1,
      data_emissao: new Date().toISOString(),
      chave_acesso: chave,
      valor_total: valor,
      icms: valor * 0.18,
      pis: valor * 0.0165,
      cofins: valor * 0.076,
      emitente: distProfile?.nome || 'Distribuidora',
      destinatario: postoProfile?.nome || 'Posto',
      combustivel: 'Diesel S10',
      volume: 15000,
    }])
    if (nfeErr) throw new Error(`NF-e: ${nfeErr.message}`)

    await postoClient.auth.signOut()
    await distClient.auth.signOut()

    return Response.json({
      message: 'Dados demo carregados com sucesso!',
      counts: { leiloes: 2, lances: 4, contratos: 1, pagamentos: 1, nfes: 1 },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}
