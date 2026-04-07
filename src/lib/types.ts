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
  prazo_entrega: number
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
  dist_id: string
  preco: number
  prazo: number
  observacoes: string
  created_at: string
  distribuidora?: Profile
}

export interface Contrato {
  id: string
  leilao_id: string
  lance_id: string
  posto_id: string
  dist_id: string
  valor: number
  clausulas: string[] | null
  hash_contrato: string | null
  assinatura_posto: string | null
  assinatura_dist: string | null
  assinado_posto_em: string | null
  assinado_dist_em: string | null
  status: string
  created_at: string
  posto?: Profile
  leilao?: Leilao
  lance?: Lance
}

export interface Pagamento {
  id: string
  contrato_id: string
  valor: number
  status: string
  metodo: string
  pago_em: string | null
  created_at: string
  contrato?: Contrato
}

export interface Nfe {
  id: string
  contrato_id: string
  numero: number
  serie: number
  data_emissao: string
  chave_acesso: string
  valor_total: number
  icms: number
  pis: number
  cofins: number
  emitente: string
  destinatario: string
  combustivel: string
  volume: number
  status: string
  created_at: string
}

export interface Avaliacao {
  id: string
  contrato_id: string
  rating: number
  comentario: string
  created_at: string
}
