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

    // Leilões
    const now = new Date()
    const leilao1EndTime = new Date(now.getTime() + 3 * 3600000).toISOString()
    const leilao2EndTime = new Date(now.getTime() + 24 * 3600000).toISOString()

    const { data: leiloesData, error: leilaoError } = await supabase.from('leiloes').insert([
      {
        posto_id: posto1Id,
        combustivel: 'Diesel S10',
        volume_litros: 15000,
        preco_teto: 5.89,
        prazo_entrega: new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0],
        duracao_horas: 3,
        regiao: 'São Paulo - Capital',
        forma_pagamento: 'PIX',
        tipo_compra: 'spot',
        status: 'aberto',
        end_time: leilao1EndTime,
      },
      {
        posto_id: posto2Id,
        combustivel: 'Gasolina Comum',
        volume_litros: 20000,
        preco_teto: 5.45,
        prazo_entrega: new Date(now.getTime() + 10 * 86400000).toISOString().split('T')[0],
        duracao_horas: 24,
        regiao: 'São Paulo - Interior',
        forma_pagamento: 'Boleto',
        tipo_compra: 'spot',
        status: 'aberto',
        end_time: leilao2EndTime,
      },
    ]).select('id')

    if (leilaoError) throw leilaoError
    if (!leiloesData || leiloesData.length < 2) throw new Error('Falha ao criar leilões')

    const leilao1Id = leiloesData[0].id
    const leilao2Id = leiloesData[1].id

    // Lances
    const { data: lancesData, error: lanceError } = await supabase.from('lances').insert([
      {
        leilao_id: leilao1Id,
        distribuidora_id: dist1Id,
        preco_litro: 5.72,
        prazo_entrega: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0],
        observacao: 'Entrega em caminhão próprio, frete incluso',
      },
      {
        leilao_id: leilao1Id,
        distribuidora_id: dist2Id,
        preco_litro: 5.65,
        prazo_entrega: new Date(now.getTime() + 6 * 86400000).toISOString().split('T')[0],
        observacao: 'Melhor preço da região Sul',
      },
      {
        leilao_id: leilao2Id,
        distribuidora_id: dist1Id,
        preco_litro: 5.32,
        prazo_entrega: new Date(now.getTime() + 8 * 86400000).toISOString().split('T')[0],
        observacao: 'Disponibilidade imediata no terminal Paulínia',
      },
      {
        leilao_id: leilao2Id,
        distribuidora_id: dist2Id,
        preco_litro: 5.38,
        prazo_entrega: new Date(now.getTime() + 9 * 86400000).toISOString().split('T')[0],
        observacao: 'Gasolina A premium',
      },
    ]).select('id')

    if (lanceError) throw lanceError
    if (!lancesData || lancesData.length < 2) throw new Error('Falha ao criar lances')

    // Contrato (leilao 1, lance 2 — melhor preço)
    const lance2Id = lancesData[1].id
    const valorTotal = 5.65 * 15000
    const raw = `${leilao1Id}|${lance2Id}|${valorTotal}|${now.toISOString()}`
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
    const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { data: contratoData, error: contratoError } = await supabase.from('contratos').insert([{
      leilao_id: leilao1Id,
      lance_id: lance2Id,
      posto_id: posto1Id,
      distribuidora_id: dist2Id,
      valor_total: valorTotal,
      volume_litros: 15000,
      preco_litro: 5.65,
      combustivel: 'Diesel S10',
      hash_sha256: hash,
      status: 'pendente',
    }]).select('id')

    if (contratoError) throw contratoError

    const contratoId = contratoData![0].id

    // Pagamento
    const pixCode = '00020126580014br.gov.bcb.pix0136fuelbid-demo-00015204000053039865802BR5925FUELBID6009SAO PAULO62070503***6304'

    const { data: pagData, error: pagError } = await supabase.from('pagamentos').insert([{
      contrato_id: contratoId,
      valor: valorTotal,
      status: 'pendente',
      pix_code: pixCode,
    }]).select('id')

    if (pagError) throw pagError

    // NF-e
    const icms = valorTotal * 0.18
    const pis = valorTotal * 0.0165
    const cofins = valorTotal * 0.076
    const valorLiquido = valorTotal - icms - pis - cofins
    const chaveAcesso = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('')

    await supabase.from('nfes').insert([{
      contrato_id: contratoId,
      pagamento_id: pagData![0].id,
      chave_acesso: chaveAcesso,
      valor_total: valorTotal,
      icms,
      pis,
      cofins,
      valor_liquido: valorLiquido,
      emitente: distribuidoras[1]?.nome || distribuidoras[0].nome,
      destinatario: postos[0].nome,
      combustivel: 'Diesel S10',
      volume_litros: 15000,
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
