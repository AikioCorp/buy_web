import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface PromoCountdownProps {
  endDate: string | null | undefined
  compact?: boolean
  className?: string
}

export function PromoCountdown({ endDate, compact = false, className = '' }: PromoCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    if (!endDate) return

    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime()
      const now = new Date().getTime()
      const difference = end - now

      if (difference <= 0) {
        setTimeLeft(null)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  if (!endDate || !timeLeft) return null

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium text-orange-600 ${className}`}>
        <Clock className="w-3 h-3" />
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}j `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-4 h-4 text-orange-500" />
      <div className="flex items-center gap-1.5">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center bg-orange-100 rounded px-2 py-1">
            <span className="text-sm font-bold text-orange-700">{timeLeft.days}</span>
            <span className="text-[10px] text-orange-600">j</span>
          </div>
        )}
        <div className="flex flex-col items-center bg-orange-100 rounded px-2 py-1">
          <span className="text-sm font-bold text-orange-700">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-[10px] text-orange-600">h</span>
        </div>
        <span className="text-orange-500 font-bold">:</span>
        <div className="flex flex-col items-center bg-orange-100 rounded px-2 py-1">
          <span className="text-sm font-bold text-orange-700">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-[10px] text-orange-600">m</span>
        </div>
        <span className="text-orange-500 font-bold">:</span>
        <div className="flex flex-col items-center bg-orange-100 rounded px-2 py-1">
          <span className="text-sm font-bold text-orange-700">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-[10px] text-orange-600">s</span>
        </div>
      </div>
    </div>
  )
}
