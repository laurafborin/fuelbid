import type { ReactNode } from 'react'

export default function MetricCard({ label, value, icon, iconBg = 'bg-[#FFF1E8] text-[#E8621A]', sub }: {
  label: string
  value: string | number
  icon: ReactNode
  iconBg?: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-green-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
