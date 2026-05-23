'use client'

import { useEffect, useState } from 'react'

export default function Countdown({ endDate }: { endDate: string }) {
  const [h, setH] = useState(0)
  const [m, setM] = useState(0)
  const [s, setS] = useState(0)
  const [ended, setEnded] = useState(false)

  useEffect(() => {
    function update() {
      const diff = new Date(endDate).getTime() - Date.now()
      if (diff <= 0) {
        setEnded(true)
        setH(0); setM(0); setS(0)
        return
      }
      setH(Math.floor(diff / 3600000))
      setM(Math.floor((diff % 3600000) / 60000))
      setS(Math.floor((diff % 60000) / 1000))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  if (ended) {
    return <span className="font-mono text-sm font-semibold text-red-500">Encerrado</span>
  }

  const totalMinutes = h * 60 + m
  const color = totalMinutes < 15 ? 'text-red-500' : totalMinutes < 60 ? 'text-amber-500' : 'text-gray-900'
  const pulse = totalMinutes < 15 ? 'animate-pulse' : ''

  return (
    <span className={`font-mono font-bold tracking-widest ${color} ${pulse}`}>
      <span className="text-lg">{String(h).padStart(2, '0')}</span>
      <span className="text-xs text-gray-400 font-normal">h </span>
      <span className="text-lg">{String(m).padStart(2, '0')}</span>
      <span className="text-xs text-gray-400 font-normal">m </span>
      <span className="text-lg">{String(s).padStart(2, '0')}</span>
      <span className="text-xs text-gray-400 font-normal">s</span>
    </span>
  )
}
