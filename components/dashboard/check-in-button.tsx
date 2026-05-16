'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/ui/modal'
import { useDispatch, useAppState } from '@/lib/store'
import { isTodayCheckedIn, calcStreak } from '@/lib/utils'

export function CheckInButton() {
  const dispatch = useDispatch()
  const { frequencia } = useAppState()
  const [open, setOpen] = useState(false)

  const checkedIn = isTodayCheckedIn(frequencia.registros)
  const streak = calcStreak(frequencia.registros)

  const handleConfirm = () => {
    dispatch({ type: 'CHECK_IN' })
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          variant={checkedIn ? 'ghost' : 'solid'}
          onClick={() => !checkedIn && setOpen(true)}
          className="gap-2"
          disabled={checkedIn}
        >
          {checkedIn ? (
            <>
              <CheckCircle className="size-4 text-emerald-500" />
              <span>Check-in feito!</span>
            </>
          ) : (
            <>
              <Circle className="size-4" />
              <span>Fazer check-in</span>
            </>
          )}
        </Button>

        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5">
            <Flame className="size-4 text-orange-500" />
            <span className="text-sm font-semibold text-[var(--text)]">{streak}</span>
            <span className="text-xs text-[var(--text-muted)]">{streak === 1 ? 'dia' : 'dias'}</span>
          </div>
        )}
      </div>

      <ConfirmModal
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Confirmar check-in"
        message={`Confirmar presença de hoje? Isso registrará ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}.`}
        confirmLabel="Confirmar presença"
      />
    </>
  )
}
