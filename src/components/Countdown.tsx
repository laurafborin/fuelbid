'use client'

import { useEffect, useState } from 'react'

export default function Countdown({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    function update() {
      const diff = new Date(endDate).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Encerrado')
        setUrgent(true)
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      setUrgent(h < 1)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [endDate])

  return (
    <span className={`font-mono text-sm font-semibold ${urgent ? 'text-red-600' : 'text-gray-700'}`}>
      {timeLeft}
    </span>
  )
}
