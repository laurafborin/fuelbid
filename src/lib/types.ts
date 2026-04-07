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
  volume: number
  preco_teto: number
  prazo_entrega: string
  regiao: string
  forma_pagamento: string
  tipo_compra: string
  status: 'aberto' | 'encerrado' | 'contratado'
  created_at: string
  deadline: string
  posto?: Profile
}

export interface Lance {
  id: string
  leilao_id: string
  user_id: string
  preco: number
  prazo: string
  created_at: string
  distribuidora?: Profile
}

export interface Contrato {
  id: string
  leilao_id: string
  lance_id: string
  posto_id: string
  valor: number
  assinatura_posto: string | null
  assinatura_dist: string | null
  status: 'pendente' | 'assinado_posto' | 'assinado_distribuidora' | 'assinado' | 'concluido'
  created_at: string
  posto?: Profile
  distribuidora?: Profile
  leilao?: Leilao
  lance?: Lance
}

export interface Pagamento {
  id: string
  contrato_id: string
  valor: number
  status: 'pendente' | 'confirmado'
  created_at: string
  contrato?: Contrato
}

export interface Nfe {
  id: string
  contrato_id: string
  chave_acesso: string
  valor_total: number
  icms: number
  pis: number
  cofins: number
  emitente: string
  destinatario: string
  combustivel: string
  volume: number
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
