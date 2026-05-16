'use client'

import { useState } from 'react'
import { Timer, Play, Pause, Square, ChevronDown } from 'lucide-react'
import { cn, formatTimer } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Progress } from '@/components/ui/progress'
import { useTimer } from '@/hooks/use-timer'
import type { Day } from '@/types'

const PRESETS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '25 min', seconds: 25 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
]

interface TimerButtonProps {
  day: Day
}

export function TimerButton({ day }: TimerButtonProps) {
  const { timeLeft, status, duration, display, progress, label, start, pause, resume, stop } = useTimer(day)
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState('')

  const isActive = status === 'running' || status === 'paused'
  const isDone = status === 'done'

  const handlePreset = (seconds: number, lbl: string) => {
    start(seconds, lbl)
    setOpen(false)
  }

  const handleCustom = () => {
    const mins = parseInt(custom, 10)
    if (!mins || mins < 1 || mins > 180) return
    start(mins * 60, `${mins} min`)
    setOpen(false)
    setCustom('')
  }

  return (
    <>
      <div className="flex items-center gap-1.5">
        {isActive || isDone ? (
          <div className="flex items-center gap-1.5">
            <div className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono font-semibold',
              isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
            )}>
              <Timer className="size-3" />
              {isDone ? 'Concluído!' : display}
            </div>

            {!isDone && (
              <>
                {status === 'running' ? (
                  <button onClick={pause} className="p-1 text-[var(--text-muted)] hover:text-[var(--text)]">
                    <Pause className="size-3.5" />
                  </button>
                ) : (
                  <button onClick={resume} className="p-1 text-[var(--text-muted)] hover:text-[var(--text)]">
                    <Play className="size-3.5" />
                  </button>
                )}
              </>
            )}

            <button onClick={stop} className="p-1 text-[var(--text-muted)] hover:text-red-500">
              <Square className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <Timer className="size-3.5" />
            Timer
            <ChevronDown className="size-3" />
          </button>
        )}
      </div>

      {isActive && !isDone && (
        <Progress value={progress} max={100} size="sm" className="mt-1" />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Iniciar timer" size="sm">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map(({ label, seconds }) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => handlePreset(seconds, label)}
                className="w-full"
              >
                {label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCustom()}
              placeholder="Minutos personalizados"
              min={1}
              max={180}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
            />
            <Button onClick={handleCustom} disabled={!custom}>
              Iniciar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
