'use client'

import { useMemo } from 'react'
import { format, eachDayOfInterval, startOfYear, endOfYear, getDay, startOfWeek, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAppState } from '@/lib/store'

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count === 1) return 2
  return 4
}

export function Heatmap() {
  const { frequencia } = useAppState()
  const registros = new Set(frequencia.registros)

  const { weeks, monthPositions } = useMemo(() => {
    const now = new Date()
    const start = startOfYear(now)
    const end = endOfYear(now)
    const days = eachDayOfInterval({ start, end })

    // Pad days to start on Sunday
    const firstDow = getDay(start)
    const paddedDays: (Date | null)[] = [
      ...Array(firstDow).fill(null),
      ...days,
    ]

    // Split into weeks
    const weeks: (Date | null)[][] = []
    for (let i = 0; i < paddedDays.length; i += 7) {
      weeks.push(paddedDays.slice(i, i + 7))
    }

    // Month label positions (week index where month starts)
    const monthPositions: { label: string; weekIndex: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, wi) => {
      const firstReal = week.find(d => d !== null)
      if (firstReal) {
        const m = firstReal.getMonth()
        if (m !== lastMonth) {
          monthPositions.push({ label: MONTH_LABELS[m], weekIndex: wi })
          lastMonth = m
        }
      }
    })

    return { weeks, monthPositions }
  }, [])

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 pl-8">
          {monthPositions.map(({ label, weekIndex }) => (
            <div
              key={label}
              className="text-[10px] text-[var(--text-faint)]"
              style={{ gridColumnStart: weekIndex + 1, minWidth: 11, marginLeft: weekIndex === 0 ? 0 : undefined }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] pr-1">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-[10px] text-[var(--text-faint)] w-6 text-right leading-[11px]">
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  if (!day) {
                    return <div key={di} className="heatmap-cell opacity-0" />
                  }
                  const key = format(day, 'yyyy-MM-dd')
                  const checked = registros.has(key)
                  const isToday = key === today
                  return (
                    <div
                      key={di}
                      className={`heatmap-cell ${isToday ? 'ring-1 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--bg)]' : ''}`}
                      data-level={checked ? getLevel(1) : 0}
                      title={`${format(day, "d 'de' MMMM", { locale: ptBR })}${checked ? ' ✓' : ''}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2 justify-end text-[10px] text-[var(--text-faint)]">
          <span>Menos</span>
          {([0, 1, 2, 3, 4] as const).map(l => (
            <div key={l} className="heatmap-cell" data-level={l} />
          ))}
          <span>Mais</span>
        </div>
      </div>
    </div>
  )
}
