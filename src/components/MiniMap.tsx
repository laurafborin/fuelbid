export default function MiniMap({ points }: { points: { lat: number; lng: number; nome: string }[] }) {
  if (points.length === 0) return <div className="text-sm text-gray-400">Sem dados de localização</div>

  const minLat = Math.min(...points.map(p => p.lat))
  const maxLat = Math.max(...points.map(p => p.lat))
  const minLng = Math.min(...points.map(p => p.lng))
  const maxLng = Math.max(...points.map(p => p.lng))

  const padLat = (maxLat - minLat) * 0.2 || 0.01
  const padLng = (maxLng - minLng) * 0.2 || 0.01

  function toX(lng: number) {
    return ((lng - minLng + padLng) / (maxLng - minLng + 2 * padLng)) * 280 + 10
  }
  function toY(lat: number) {
    return 190 - ((lat - minLat + padLat) / (maxLat - minLat + 2 * padLat)) * 180
  }

  return (
    <svg viewBox="0 0 300 200" className="w-full max-w-sm bg-green-50 rounded-lg border border-green-200">
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={toX(p.lng)} cy={toY(p.lat)} r="6" fill="#E8621A" />
          <text x={toX(p.lng)} y={toY(p.lat) - 10} textAnchor="middle" className="text-[8px] fill-gray-700">{p.nome}</text>
        </g>
      ))}
    </svg>
  )
}
