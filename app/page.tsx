'use client'

import Link from 'next/link'
import { BookOpen, Library } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckInButton } from '@/components/dashboard/check-in-button'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { Heatmap } from '@/components/dashboard/heatmap'
import { StreakDots } from '@/components/dashboard/streak-dots'
import { MonthBars } from '@/components/dashboard/month-bars'
import { getGreeting, formatDate } from '@/lib/utils'

export default function DashboardPage() {
  const greeting = getGreeting()
  const today = formatDate(new Date())

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[var(--text-muted)]" style={{ textTransform: 'none' }}>
          {today.charAt(0).toUpperCase() + today.slice(1)}
        </p>
        <h1 className="text-3xl font-bold text-[var(--text)]">{greeting} 👋</h1>
        <p className="text-[var(--text-muted)]">Registre sua presença e acompanhe seu progresso.</p>
      </div>

      {/* Check-in */}
      <CheckInButton />

      {/* Stats */}
      <StatsCards />

      {/* Streak + Month bars */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card elevated>
          <CardHeader>
            <CardTitle>Últimos 14 dias</CardTitle>
          </CardHeader>
          <StreakDots />
        </Card>

        <Card elevated>
          <CardHeader>
            <CardTitle>Meses do ano</CardTitle>
          </CardHeader>
          <MonthBars />
        </Card>
      </div>

      {/* Heatmap */}
      <Card elevated>
        <CardHeader>
          <CardTitle>Frequência anual</CardTitle>
        </CardHeader>
        <Heatmap />
      </Card>

      {/* Quick nav */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/sala" className="group">
          <Card className="border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-subtle)] group-hover:bg-[var(--accent)] transition-colors">
                <BookOpen className="size-5 text-[var(--accent)] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">Sala de Aulas</p>
                <p className="text-sm text-[var(--text-muted)]">Tarefas semanais e timer Pomodoro</p>
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/biblioteca" className="group">
          <Card className="border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-subtle)] group-hover:bg-[var(--accent)] transition-colors">
                <Library className="size-5 text-[var(--accent)] group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">Biblioteca</p>
                <p className="text-sm text-[var(--text-muted)]">Materiais, links e arquivos</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  )
}
