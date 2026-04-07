const colors: Record<string, string> = {
  aberto: 'bg-green-100 text-green-800',
  encerrado: 'bg-yellow-100 text-yellow-800',
  contratado: 'bg-blue-100 text-blue-800',
  pendente: 'bg-gray-100 text-gray-800',
  assinado: 'bg-blue-100 text-blue-800',
  confirmado: 'bg-green-100 text-green-800',
  concluido: 'bg-green-100 text-green-800',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  )
}
