export interface Profile {
  id: string
  tipo: 'posto' | 'distribuidora'
  nome: string
  cnpj: string
  telefone: string
  cidade: string
  estado: string
  lat: number
  lng: number
  score: number
  bandeira: string
  volume_mensal: number
  combustiveis: string[]
  total_deals: number
  regiao_atuacao: string[]
  capacidade_logistica: string
  created_at: string
}

export interface Leilao {
  id: string
  posto_id: string
  combustivel: string
  volume_litros: number
  preco_teto: number
  prazo_entrega: string
  duracao_horas: number
  regiao: string
  forma_pagamento: string
  tipo_compra: string
  status: 'aberto' | 'encerrado' | 'contratado'
  created_at: string
  end_time: string
  posto?: Profile
}

export interface Lance {
  id: string
  leilao_id: string
  distribuidora_id: string
  preco_litro: number
  prazo_entrega: string
  observacao: string
  created_at: string
  distribuidora?: Profile
}

export interface Contrato {
  id: string
  leilao_id: string
  lance_id: string
  posto_id: string
  distribuidora_id: string
  valor_total: number
  volume_litros: number
  preco_litro: number
  combustivel: string
  hash_sha256: string
  assinatura_posto: string | null
  assinatura_distribuidora: string | null
  status: 'pendente' | 'assinado_posto' | 'assinado_distribuidora' | 'assinado' | 'concluido'
  created_at: string
  posto?: Profile
  distribuidora?: Profile
  leilao?: Leilao
}

export interface Pagamento {
  id: string
  contrato_id: string
  valor: number
  status: 'pendente' | 'confirmado'
  pix_code: string
  created_at: string
  contrato?: Contrato
}

export interface Nfe {
  id: string
  contrato_id: string
  pagamento_id: string
  chave_acesso: string
  valor_total: number
  icms: number
  pis: number
  cofins: number
  valor_liquido: number
  emitente: string
  destinatario: string
  combustivel: string
  volume_litros: number
  created_at: string
}

export interface Avaliacao {
  id: string
  contrato_id: string
  avaliador_id: string
  avaliado_id: string
  nota: number
  comentario: string
  created_at: string
}
