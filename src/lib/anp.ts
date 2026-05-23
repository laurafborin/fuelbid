import type { Contrato } from './types'

/**
 * Preços de referência por litro (R$/L) para o mercado de distribuição.
 *
 * Base: ANP — Levantamento de Preços de Combustíveis (preço médio de
 * distribuição). Estes valores são a ÂNCORA da auditoria: a economia gerada
 * pela plataforma é medida contra eles, dando ao posto uma "métrica auditável
 * de economia" e validação institucional do preço praticado (cf. Quadro 6 do TCC).
 *
 * COMO ATUALIZAR: substitua os números abaixo pela média semanal mais recente
 * publicada pela ANP para a região de atuação. Mantidos aqui de forma estática
 * para o MVP; em produção, virão de uma tabela `precos_referencia` populada por
 * um job que consome o portal de dados abertos da ANP.
 */
export const ANP_REFERENCIA: Record<string, number> = {
  'Diesel S-10': 5.95,
  'Diesel S-500': 5.8,
  'Gasolina Comum': 5.6,
  'Gasolina Aditivada': 5.75,
  'Etanol Hidratado': 3.85,
}

/** Data da referência (atualize junto com os preços acima). */
export const ANP_REFERENCIA_DATA = 'Levantamento ANP — referência'

export function getReferenciaAnp(combustivel?: string | null): number | null {
  if (!combustivel) return null
  return ANP_REFERENCIA[combustivel] ?? null
}

export interface AuditoriaItem {
  contrato: Contrato
  combustivel: string
  volume: number
  /** Preço efetivamente pago por litro = valor / volume. */
  precoLitro: number
  precoTeto: number | null
  refAnp: number | null
  /** Economia vs. preço-teto definido pelo próprio posto no leilão. */
  economiaTetoRS: number
  economiaTetoPct: number
  /** Economia vs. referência ANP (null quando não há preço de referência). */
  economiaAnpRS: number | null
  economiaAnpPct: number | null
}

export interface AuditoriaResumo {
  itens: AuditoriaItem[]
  totalContratos: number
  volumeTotal: number
  economiaTetoTotal: number
  economiaAnpTotal: number
  /** Desconto médio vs. ANP ponderado por volume (fração 0–1). */
  descontoMedioAnp: number
  /** Quantos contratos têm referência ANP disponível. */
  cobertosPorAnp: number
}

/**
 * Calcula a economia auditada de uma lista de contratos.
 * Considera apenas contratos fechados (com valor e leilão associado).
 * Toda a lógica é determinística e derivada de dados reais — não há números fixos.
 */
export function auditarContratos(contratos: Contrato[]): AuditoriaResumo {
  const itens: AuditoriaItem[] = []

  for (const c of contratos) {
    const volume = c.leilao?.volume ?? 0
    if (!c.valor || volume <= 0) continue // ignora contratos sem dados suficientes

    const combustivel = c.leilao?.combustivel ?? '—'
    const precoLitro = c.valor / volume
    const precoTeto = c.leilao?.preco_teto ?? null
    const refAnp = getReferenciaAnp(combustivel)

    const economiaTetoRS = precoTeto ? Math.max(0, precoTeto - precoLitro) * volume : 0
    const economiaTetoPct = precoTeto && precoTeto > 0 ? (precoTeto - precoLitro) / precoTeto : 0

    const economiaAnpRS = refAnp ? (refAnp - precoLitro) * volume : null
    const economiaAnpPct = refAnp && refAnp > 0 ? (refAnp - precoLitro) / refAnp : null

    itens.push({
      contrato: c,
      combustivel,
      volume,
      precoLitro,
      precoTeto,
      refAnp,
      economiaTetoRS,
      economiaTetoPct,
      economiaAnpRS,
      economiaAnpPct,
    })
  }

  const volumeTotal = itens.reduce((s, i) => s + i.volume, 0)
  const economiaTetoTotal = itens.reduce((s, i) => s + i.economiaTetoRS, 0)
  const economiaAnpTotal = itens.reduce((s, i) => s + (i.economiaAnpRS ?? 0), 0)

  // Desconto médio vs. ANP ponderado por volume (só sobre itens com referência).
  const comAnp = itens.filter(i => i.economiaAnpPct !== null)
  const volComAnp = comAnp.reduce((s, i) => s + i.volume, 0)
  const descontoMedioAnp = volComAnp > 0
    ? comAnp.reduce((s, i) => s + (i.economiaAnpPct as number) * i.volume, 0) / volComAnp
    : 0

  return {
    itens,
    totalContratos: itens.length,
    volumeTotal,
    economiaTetoTotal,
    economiaAnpTotal,
    descontoMedioAnp,
    cobertosPorAnp: comAnp.length,
  }
}

/** Formata reais em pt-BR. */
export function brl(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/** Formata percentual a partir de uma fração (0.12 -> "12,0%"). */
export function pct(frac: number): string {
  return (frac * 100).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
}
