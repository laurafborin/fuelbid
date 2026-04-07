import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // First, find the posto and distribuidora profiles by tipo
    const { data: postos } = await supabase
      .from('profiles')
      .select('id, nome, tipo')
      .eq('tipo', 'posto')
      .limit(2)

    const { data: distribuidoras } = await supabase
      .from('profiles')
      .select('id, nome, tipo')
      .eq('tipo', 'distribuidora')
      .limit(2)

    if (!postos?.length || !distribuidoras?.length) {
      return Response.json({
        error: 'Perfis não encontrados. Execute "Configurar Perfis" primeiro.',
        hint: 'Clique no botão "Configurar Perfis" na landing page antes de carregar os dados demo.',
      }, { status: 400 })
    }

    const posto1Id = postos[0].id
    const posto2Id = postos[1]?.id || postos[0].id
    const dist1Id = distribuidoras[0].id
    const dist2Id = distribuidoras[1]?.id || distribuidoras[0].id

    // Clean existing demo data (order matters for FKs)
    await supabase.from('nfes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('pagamentos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('contratos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('lances').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('leiloes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Leiloes
    const now = new Date()
    const leilao1Deadline = new Date(now.getTime() + 3 * 3600000).toISOString()
    const leilao2Deadline = new Date(now.getTime() + 24 * 3600000).toISOString()

    const { data: leiloesData, error: leilaoError } = await supabase.from('leiloes').insert([
      {
        posto_id: posto1Id,
        combustivel: 'Diesel S10',
        volume: 15000,
        preco_teto: 5.89,
        prazo_entrega: 7,
        regiao: 'São Paulo - Capital',
        forma_pagamento: 'PIX',
        tipo_compra: 'individual',
        status: 'aberto',
        deadline: leilao1Deadline,
      },
      {
        posto_id: posto2Id,
        combustivel: 'Gasolina Comum',
        volume: 20000,
        preco_teto: 5.45,
        prazo_entrega: 10,
        regiao: 'São Paulo - Interior',
        forma_pagamento: 'Boleto',
        tipo_compra: 'individual',
        status: 'aberto',
        deadline: leilao2Deadline,
      },
    ]).select('id')

    if (leilaoError) throw leilaoError
    if (!leiloesData || leiloesData.length < 2) throw new Error('Falha ao criar leilões')

    const leilao1Id = leiloesData[0].id
    const leilao2Id = leiloesData[1].id

    // Lances (distribuidora_id removed - DB uses user_id via RLS/trigger)
    const { data: lancesData, error: lanceError } = await supabase.from('lances').insert([
      {
        leilao_id: leilao1Id,
        dist_id: dist1Id,
        preco: 5.72,
        prazo: 5,
      },
      {
        leilao_id: leilao1Id,
        dist_id: dist2Id,
        preco: 5.65,
        prazo: 6,
      },
      {
        leilao_id: leilao2Id,
        dist_id: dist1Id,
        preco: 5.32,
        prazo: 8,
      },
      {
        leilao_id: leilao2Id,
        dist_id: dist2Id,
        preco: 5.38,
        prazo: 9,
      },
    ]).select('id')

    if (lanceError) throw lanceError
    if (!lancesData || lancesData.length < 2) throw new Error('Falha ao criar lances')

    // Contrato (leilao 1, lance 2 - melhor preco)
    const lance2Id = lancesData[1].id
    const valor = 5.65 * 15000

    const { data: contratoData, error: contratoError } = await supabase.from('contratos').insert([{
      leilao_id: leilao1Id,
      lance_id: lance2Id,
      posto_id: posto1Id,
      dist_id: dist2Id,
      valor,
      status: 'pendente',
    }]).select('id')

    if (contratoError) throw contratoError

    const contratoId = contratoData![0].id

    // Pagamento (pix_code removed - doesn't exist in DB)
    const { data: pagData, error: pagError } = await supabase.from('pagamentos').insert([{
      contrato_id: contratoId,
      valor,
      status: 'pendente',
    }]).select('id')

    if (pagError) throw pagError

    // NF-e (pagamento_id and valor_liquido removed - don't exist in DB)
    const icms = valor * 0.18
    const pis = valor * 0.0165
    const cofins = valor * 0.076
    const chaveAcesso = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('')

    await supabase.from('nfes').insert([{
      contrato_id: contratoId,
      chave_acesso: chaveAcesso,
      valor_total: valor,
      icms,
      pis,
      cofins,
      emitente: distribuidoras[1]?.nome || distribuidoras[0].nome,
      destinatario: postos[0].nome,
      combustivel: 'Diesel S10',
      volume: 15000,
    }])

    return Response.json({
      message: 'Dados demo carregados com sucesso!',
      counts: {
        leiloes: 2,
        lances: 4,
        contratos: 1,
        pagamentos: 1,
        nfes: 1,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : JSON.stringify(error)
    return Response.json({ error: message }, { status: 500 })
  }
}
