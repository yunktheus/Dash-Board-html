'use client'

import { useMemo } from 'react'
import { useAppState } from '@/lib/store'

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function MonthBars() {
  const { frequencia } = useAppState()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const bars = useMemo(() => {
    const counts = Array(12).fill(0)
    frequencia.registros.forEach(r => {
      const [year, month] = r.split('-').map(Number)
      if (year === currentYear) counts[month - 1]++
    })
    const max = Math.max(...counts, 1)
    return counts.map((count, i) => ({ count, pct: (count / max) * 100, month: i }))
  }, [frequencia.registros, currentYear])

  return (
    <div className="flex items-end gap-1 h-16">
      {bars.map(({ count, pct, month }) => (
        <div key={month} className="flex flex-col items-center gap-0.5 flex-1">
          <div className="w-full flex items-end justify-center h-12">
            <div
              className={`w-full max-w-6 rounded-t-sm transition-all duration-500 ${
                month === currentMonth
                  ? 'bg-[var(--accent)]'
                  : 'bg-[var(--border)] dark:bg-[var(--border)]'
              }`}
              style={{ height: `${Math.max(pct, count > 0 ? 8 : 2)}%` }}
              title={`${MONTH_LABELS[month]}: ${count} check-ins`}
            />
          </div>
          <span className="text-[9px] text-[var(--text-faint)]">{MONTH_LABELS[month]}</span>
        </div>
      ))}
    </div>
  )
}
