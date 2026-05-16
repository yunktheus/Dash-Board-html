'use client'

import { useMemo } from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TaskList } from './task-list'
import { NotesSection } from './notes-section'
import { TimerButton } from './timer-button'
import { useAppState } from '@/lib/store'
import { DAY_LABELS } from '@/lib/utils'
import type { Day } from '@/types'

interface DayCardProps {
  day: Day
}

export function DayCard({ day }: DayCardProps) {
  const { tasks } = useAppState()
  const dayTasks = tasks[day]

  const { done, total, pct } = useMemo(() => {
    const done = dayTasks.filter(t => t.done).length
    const total = dayTasks.length
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [dayTasks])

  return (
    <Card elevated className="flex flex-col gap-4">
      <CardHeader>
        <CardTitle className="text-base">{DAY_LABELS[day]}</CardTitle>
        <div className="flex items-center gap-2">
          {total > 0 && (
            <Badge variant={pct === 100 ? 'success' : 'default'}>
              {done}/{total}
            </Badge>
          )}
        </div>
      </CardHeader>

      {total > 0 && <Progress value={pct} size="sm" color={pct === 100 ? 'success' : 'brand'} />}

      <TaskList day={day} />

      <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-2">
        <TimerButton day={day} />
        <NotesSection day={day} />
      </div>
    </Card>
  )
}
