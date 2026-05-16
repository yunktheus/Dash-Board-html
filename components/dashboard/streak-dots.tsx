'use client'

import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useAppState } from '@/lib/store'

const DAYS = 14

export function StreakDots() {
  const { frequencia } = useAppState()
  const registros = new Set(frequencia.registros)

  const days = useMemo(() => {
    return Array.from({ length: DAYS }, (_, i) => {
      const date = subDays(new Date(), DAYS - 1 - i)
      const key = format(date, 'yyyy-MM-dd')
      return {
        key,
        label: format(date, 'dd', { locale: ptBR }),
        dayName: format(date, 'EEE', { locale: ptBR }),
        checked: registros.has(key),
        isToday: i === DAYS - 1,
      }
    })
  }, [registros])

  return (
    <div className="flex gap-1.5 items-end flex-wrap">
      {days.map(({ key, label, dayName, checked, isToday }) => (
        <div key={key} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-[var(--text-faint)]">{dayName}</span>
          <div
            title={key}
            className={cn(
              'size-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors',
              checked
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--border)] text-[var(--text-faint)]',
              isToday && !checked && 'ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg)]'
            )}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
