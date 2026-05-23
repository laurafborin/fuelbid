import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const log: string[] = []

  try {
    // 1. Auth as posto
    const postoClient = createClient(url, key)
    const { data: pa, error: paErr } = await postoClient.auth.signInWithPassword({ email: 'posto@fuelbid.com', password: '123456' })
    if (paErr) throw new Error(`Auth posto: ${paErr.message}`)
    const postoId = pa.user.id
    const { data: postoPf } = await postoClient.from('profiles').select('nome').eq('id', postoId).single()
    log.push(`Auth posto OK: ${postoPf?.nome}`)

    // 2. Auth as distribuidora
    const distClient = createClient(url, key)
    const { data: da, error: daErr } = await distClient.auth.signInWithPassword({ email: 'distribuidora@fuelbid.com', password: '123456' })
    if (daErr) throw new Error(`Auth dist: ${daErr.message}`)
    const distId = da.user.id
    const { data: distPf } = await distClient.from('profiles').select('nome').eq('id', distId).single()
    log.push(`Auth dist OK: ${distPf?.nome}`)

    // 3. Clean (FK order)
    await postoClient.from('nfes').delete().gte('created_at', '1970-01-01')
    await postoClient.from('pagamentos').delete().gte('created_at', '1970-01-01')
    await postoClient.from('contratos').delete().gte('created_at', '1970-01-01')
    await distClient.from('lances').delete().gte('created_at', '1970-01-01')
    await postoClient.from('leiloes').delete().gte('created_at', '1970-01-01')
    log.push('Clean OK')

    // 4. Leilões (as posto)
    const now = Date.now()
    const { data: leiloes, error: lErr } = await postoClient.from('leiloes').insert([
      { posto_id: postoId, combustivel: 'Diesel S-10', volume: 15000, preco_teto: 5.89, prazo_entrega: 7, regiao: 'São Paulo - Capital', forma_pagamento: 'PIX', tipo_compra: 'individual', status: 'aberto', deadline: new Date(now + 3 * 3600000).toISOString() },
      { posto_id: postoId, combustivel: 'Gasolina Comum', volume: 20000, preco_teto: 5.45, prazo_entrega: 5, regiao: 'Campinas e Região', forma_pagamento: 'Boleto', tipo_compra: 'individual', status: 'aberto', deadline: new Date(now + 2 * 3600000).toISOString() },
      { posto_id: postoId, combustivel: 'Etanol Hidratado', volume: 10000, preco_teto: 3.79, prazo_entrega: 3, regiao: 'São Paulo - Capital', forma_pagamento: 'PIX', tipo_compra: 'coletiva', status: 'aberto', deadline: new Date(now + 1 * 3600000).toISOString() },
    ]).select('id')
    if (lErr) throw new Error(`Leilões: ${lErr.message}`)
    log.push(`3 leilões criados`)

    const [lA, lB, lC] = leiloes!

    // 5. Lances (as distribuidora)
    const { data: lances, error: lcErr } = await distClient.from('lances').insert([
      { leilao_id: lA.id, dist_id: distId, preco: 5.72, prazo: 5, observacoes: 'Entrega dedicada com caminhão próprio' },
      { leilao_id: lA.id, dist_id: distId, preco: 5.65, prazo: 4, observacoes: 'Frete incluso, terminal Paulínia' },
      { leilao_id: lA.id, dist_id: distId, preco: 5.58, prazo: 3, observacoes: 'Pronta entrega, estoque garantido' },
      { leilao_id: lB.id, dist_id: distId, preco: 5.32, prazo: 4, observacoes: 'Gasolina A premium certificada' },
      { leilao_id: lB.id, dist_id: distId, preco: 5.28, prazo: 2, observacoes: 'Entrega expressa disponível' },
      { leilao_id: lC.id, dist_id: distId, preco: 3.55, prazo: 3, observacoes: 'Etanol anidro de alta qualidade' },
    ]).select('id')
    if (lcErr) throw new Error(`Lances: ${lcErr.message}`)
    log.push(`6 lances criados`)

    // 6. Contrato (best lance on leilão A = 5.58)
    const bestLance = lances![2]
    const valor = 5.58 * 15000
    const hash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const assinadoEm = new Date().toISOString()

    const { data: contrato, error: cErr } = await postoClient.from('contratos').insert([{
      leilao_id: lA.id,
      lance_id: bestLance.id,
      posto_id: postoId,
      dist_id: distId,
      valor,
      status: 'assinado',
      clausulas: [
        'O presente contrato refere-se ao fornecimento de Diesel S-10 conforme especificações ANP.',
        'O volume total de 15.000 litros será entregue em remessa única no prazo de 3 dias úteis.',
        'O preço acordado de R$ 5,58/L é fixo e inclui frete até o posto comprador.',
        'O pagamento será realizado via PIX em até 24 horas após confirmação da entrega.',
        'Ambas as partes concordam com os termos da plataforma Tanqe e legislação vigente.',
      ],
      hash_contrato: hash,
      assinatura_posto: 'data:image/png;base64,signed-posto',
      assinatura_dist: 'data:image/png;base64,signed-dist',
      assinado_posto_em: assinadoEm,
      assinado_dist_em: assinadoEm,
    }]).select('id')
    if (cErr) throw new Error(`Contrato: ${cErr.message}`)
    log.push(`1 contrato criado (R$ ${valor.toLocaleString('pt-BR')})`)

    // 7. Pagamento
    const { error: pErr } = await postoClient.from('pagamentos').insert([{
      contrato_id: contrato![0].id,
      valor,
      status: 'pago',
      metodo: 'pix',
      pago_em: new Date().toISOString(),
    }])
    if (pErr) throw new Error(`Pagamento: ${pErr.message}`)
    log.push(`1 pagamento criado`)

    // 8. NF-e
    const chave = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('')
    const { error: nErr } = await postoClient.from('nfes').insert([{
      contrato_id: contrato![0].id,
      numero: 142,
      serie: 1,
      data_emissao: new Date().toISOString(),
      chave_acesso: chave,
      valor_total: valor,
      icms: valor * 0.18,
      pis: valor * 0.0165,
      cofins: valor * 0.076,
      emitente: distPf?.nome || 'Distribuidora',
      destinatario: postoPf?.nome || 'Posto',
      combustivel: 'Diesel S-10',
      volume: 15000,
      status: 'emitida',
    }])
    if (nErr) throw new Error(`NF-e: ${nErr.message}`)
    log.push(`1 NF-e emitida`)

    await postoClient.auth.signOut()
    await distClient.auth.signOut()

    return Response.json({
      message: 'Dados demo carregados com sucesso!',
      counts: { leiloes: 3, lances: 6, contratos: 1, pagamentos: 1, nfes: 1 },
      log,
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error)
    return Response.json({ error: msg, log }, { status: 500 })
  }
}
