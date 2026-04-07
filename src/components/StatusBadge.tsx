const colors: Record<string, string> = {
  aberto: 'bg-green-50 text-green-700 border-green-200',
  encerrado: 'bg-amber-50 text-amber-700 border-amber-200',
  contratado: 'bg-blue-50 text-blue-700 border-blue-200',
  pendente: 'bg-gray-50 text-gray-600 border-gray-200',
  assinado: 'bg-blue-50 text-blue-700 border-blue-200',
  assinado_posto: 'bg-blue-50 text-blue-700 border-blue-200',
  assinado_distribuidora: 'bg-blue-50 text-blue-700 border-blue-200',
  confirmado: 'bg-green-50 text-green-700 border-green-200',
  concluido: 'bg-green-50 text-green-700 border-green-200',
}

const labels: Record<string, string> = {
  aberto: 'Aberto',
  encerrado: 'Encerrado',
  contratado: 'Contratado',
  pendente: 'Pendente',
  assinado: 'Assinado',
  assinado_posto: 'Assin. Posto',
  assinado_distribuidora: 'Assin. Dist.',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold border ${colors[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {labels[status] || status}
    </span>
  )
}
