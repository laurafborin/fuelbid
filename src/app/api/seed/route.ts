import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // IDs fixos para os perfis demo
    const posto1Id = '00000000-0000-0000-0000-000000000001'
    const posto2Id = '00000000-0000-0000-0000-000000000002'
    const dist1Id = '00000000-0000-0000-0000-000000000003'
    const dist2Id = '00000000-0000-0000-0000-000000000004'

    // Limpar dados existentes (ordem importa por FKs)
    await supabase.from('nfes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('pagamentos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('contratos').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('lances').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('leiloes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    // Profiles
    const profiles = [
      {
        id: posto1Id,
        email: 'posto1@demo.com',
        tipo: 'posto',
        nome_fantasia: 'Auto Posto Estrela do Sul',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 3456-7890',
        endereco: 'Av. Paulista, 1000',
        cidade: 'São Paulo',
        estado: 'SP',
        lat: -23.5610,
        lng: -46.6560,
        score: 4.6,
      },
      {
        id: posto2Id,
        email: 'posto2@demo.com',
        tipo: 'posto',
        nome_fantasia: 'Posto Bandeirantes',
        cnpj: '23.456.789/0001-01',
        telefone: '(19) 3456-1234',
        endereco: 'Rod. Anhanguera, km 95',
        cidade: 'Campinas',
        estado: 'SP',
        lat: -22.9099,
        lng: -47.0626,
        score: 4.3,
      },
      {
        id: dist1Id,
        email: 'dist1@demo.com',
        tipo: 'distribuidora',
        nome_fantasia: 'PetroBrasil Distribuidora S.A.',
        cnpj: '34.567.890/0001-12',
        telefone: '(11) 9876-5432',
        endereco: 'Rua da Consolação, 500',
        cidade: 'São Paulo',
        estado: 'SP',
        lat: -23.5505,
        lng: -46.6480,
        score: 4.7,
      },
      {
        id: dist2Id,
        email: 'dist2@demo.com',
        tipo: 'distribuidora',
        nome_fantasia: 'Sul Petróleo Distribuidora',
        cnpj: '45.678.901/0001-23',
        telefone: '(41) 3333-4444',
        endereco: 'Av. Sete de Setembro, 2000',
        cidade: 'Curitiba',
        estado: 'PR',
        lat: -25.4284,
        lng: -49.2733,
        score: 4.4,
      },
    ]

    const { error: profileError } = await supabase.from('profiles').upsert(profiles)
    if (profileError) throw profileError

    // Leilões
    const now = new Date()
    const leilao1EndTime = new Date(now.getTime() + 2 * 3600000).toISOString()
    const leilao2EndTime = new Date(now.getTime() + 24 * 3600000).toISOString()

    const leilao1Id = '10000000-0000-0000-0000-000000000001'
    const leilao2Id = '10000000-0000-0000-0000-000000000002'

    const leiloes = [
      {
        id: leilao1Id,
        posto_id: posto1Id,
        combustivel: 'Diesel S10',
        volume_litros: 15000,
        preco_teto: 5.89,
        prazo_entrega: new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0],
        duracao_horas: 2,
        regiao: 'São Paulo - Capital',
        forma_pagamento: 'PIX',
        tipo_compra: 'spot',
        status: 'aberto',
        end_time: leilao1EndTime,
      },
      {
        id: leilao2Id,
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
    ]

    const { error: leilaoError } = await supabase.from('leiloes').upsert(leiloes)
    if (leilaoError) throw leilaoError

    // Lances
    const lance1Id = '20000000-0000-0000-0000-000000000001'
    const lance2Id = '20000000-0000-0000-0000-000000000002'
    const lance3Id = '20000000-0000-0000-0000-000000000003'
    const lance4Id = '20000000-0000-0000-0000-000000000004'

    const lances = [
      {
        id: lance1Id,
        leilao_id: leilao1Id,
        distribuidora_id: dist1Id,
        preco_litro: 5.72,
        prazo_entrega: new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0],
        observacao: 'Entrega em caminhão próprio, frete incluso',
      },
      {
        id: lance2Id,
        leilao_id: leilao1Id,
        distribuidora_id: dist2Id,
        preco_litro: 5.65,
        prazo_entrega: new Date(now.getTime() + 6 * 86400000).toISOString().split('T')[0],
        observacao: 'Melhor preço da região Sul',
      },
      {
        id: lance3Id,
        leilao_id: leilao2Id,
        distribuidora_id: dist1Id,
        preco_litro: 5.32,
        prazo_entrega: new Date(now.getTime() + 8 * 86400000).toISOString().split('T')[0],
        observacao: 'Disponibilidade imediata no terminal Paulínia',
      },
      {
        id: lance4Id,
        leilao_id: leilao2Id,
        distribuidora_id: dist2Id,
        preco_litro: 5.38,
        prazo_entrega: new Date(now.getTime() + 9 * 86400000).toISOString().split('T')[0],
        observacao: 'Gasolina A premium',
      },
    ]

    const { error: lanceError } = await supabase.from('lances').upsert(lances)
    if (lanceError) throw lanceError

    // Contrato demo (leilão 1, lance 2 aceito)
    const contratoId = '30000000-0000-0000-0000-000000000001'
    const valorTotal = 5.65 * 15000
    const raw = `${leilao1Id}|${lance2Id}|${valorTotal}|${now.toISOString()}`
    const encoder = new TextEncoder()
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw))
    const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

    const { error: contratoError } = await supabase.from('contratos').upsert([{
      id: contratoId,
      leilao_id: leilao1Id,
      lance_id: lance2Id,
      posto_id: posto1Id,
      distribuidora_id: dist2Id,
      valor_total: valorTotal,
      volume_litros: 15000,
      preco_litro: 5.65,
      combustivel: 'Diesel S10',
      hash_sha256: hash,
      assinatura_posto: null,
      assinatura_distribuidora: null,
      status: 'pendente',
    }])
    if (contratoError) throw contratoError

    // Pagamento demo
    const pagamentoId = '40000000-0000-0000-0000-000000000001'
    const pixCode = '00020126580014br.gov.bcb.pix0136fuelbid-demo-pix-00015204000053039865802BR5925FUELBID6009SAO PAULO62070503***6304'

    const { error: pagamentoError } = await supabase.from('pagamentos').upsert([{
      id: pagamentoId,
      contrato_id: contratoId,
      valor: valorTotal,
      status: 'pendente',
      pix_code: pixCode,
    }])
    if (pagamentoError) throw pagamentoError

    // NF-e demo
    const icms = valorTotal * 0.18
    const pis = valorTotal * 0.0165
    const cofins = valorTotal * 0.076
    const valorLiquido = valorTotal - icms - pis - cofins
    const chaveAcesso = Array.from({ length: 44 }, () => Math.floor(Math.random() * 10)).join('')

    const { error: nfeError } = await supabase.from('nfes').upsert([{
      id: '50000000-0000-0000-0000-000000000001',
      contrato_id: contratoId,
      pagamento_id: pagamentoId,
      chave_acesso: chaveAcesso,
      valor_total: valorTotal,
      icms,
      pis,
      cofins,
      valor_liquido: valorLiquido,
      emitente: 'Sul Petróleo Distribuidora',
      destinatario: 'Auto Posto Estrela do Sul',
      combustivel: 'Diesel S10',
      volume_litros: 15000,
    }])
    if (nfeError) throw nfeError

    return Response.json({
      message: 'Dados demo carregados com sucesso!',
      ids: {
        postos: [posto1Id, posto2Id],
        distribuidoras: [dist1Id, dist2Id],
        leiloes: [leilao1Id, leilao2Id],
        lances: [lance1Id, lance2Id, lance3Id, lance4Id],
        contrato: contratoId,
        pagamento: pagamentoId,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return Response.json({ error: message }, { status: 500 })
  }
}
