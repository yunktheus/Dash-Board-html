'use client'

import { Flame, Calendar, TrendingUp, Award } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useAppState } from '@/lib/store'
import { calcStreak, calcWeeklyAvg } from '@/lib/utils'

export function StatsCards() {
  const { frequencia } = useAppState()
  const { registros } = frequencia

  const streak = calcStreak(registros)
  const thisYear = registros.filter(r => r.startsWith(String(new Date().getFullYear()))).length
  const weeklyAvg = calcWeeklyAvg(registros)
  const allTime = registros.length

  const stats = [
    {
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      label: 'Sequência atual',
      value: streak,
      suffix: streak === 1 ? 'dia' : 'dias',
    },
    {
      icon: Calendar,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      label: 'Este ano',
      value: thisYear,
      suffix: thisYear === 1 ? 'check-in' : 'check-ins',
    },
    {
      icon: TrendingUp,
      iconColor: 'text-[var(--accent)]',
      bgColor: 'bg-[var(--accent-subtle)]',
      label: 'Média semanal',
      value: weeklyAvg,
      suffix: 'dias/semana',
    },
    {
      icon: Award,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      label: 'Total geral',
      value: allTime,
      suffix: allTime === 1 ? 'dia' : 'dias',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map(({ icon: Icon, iconColor, bgColor, label, value, suffix }) => (
        <Card key={label} className="flex flex-col gap-3">
          <div className={`flex size-9 items-center justify-center rounded-lg ${bgColor}`}>
            <Icon className={`size-5 ${iconColor}`} />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)]">{label}</p>
            <p className="text-2xl font-bold text-[var(--text)] leading-none mt-0.5">
              {value}
            </p>
            <p className="text-xs text-[var(--text-faint)] mt-0.5">{suffix}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
