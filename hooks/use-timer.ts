'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { formatTimer } from '@/lib/utils'
import type { Day } from '@/types'

export type TimerStatus = 'idle' | 'running' | 'paused' | 'done'

interface TimerHookState {
  timeLeft: number
  status: TimerStatus
  duration: number
  label: string
}

const STORAGE_KEY = 'studium_timers'

function loadTimers(): Record<string, TimerHookState> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

function saveTimers(timers: Record<string, TimerHookState>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(timers))
  } catch {}
}

export function useTimer(day: Day) {
  const [state, setState] = useState<TimerHookState>(() => {
    if (typeof window === 'undefined') {
      return { timeLeft: 25 * 60, status: 'idle', duration: 25 * 60, label: '25 min' }
    }
    const saved = loadTimers()[day]
    if (saved) {
      // If it was running, check if it should have finished
      if (saved.status === 'running') {
        const elapsed = Math.floor((Date.now() - (saved as any)._startedAt) / 1000)
        const remaining = saved.duration - elapsed
        if (remaining <= 0) {
          return { ...saved, timeLeft: 0, status: 'done' }
        }
        return { ...saved, timeLeft: remaining }
      }
      return saved
    }
    return { timeLeft: 25 * 60, status: 'idle', duration: 25 * 60, label: '25 min' }
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number>(0)

  const tick = useCallback(() => {
    setState(prev => {
      if (prev.status !== 'running') return prev
      const next = prev.timeLeft - 1
      if (next <= 0) {
        // Notify
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Studium — Timer!', {
            body: `Sessão de ${prev.label} concluída! `,
          })
        }
        return { ...prev, timeLeft: 0, status: 'done' }
      }
      return { ...prev, timeLeft: next }
    })
  }, [])

  useEffect(() => {
    if (state.status === 'running') {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [state.status, tick])

  // Persist state
  useEffect(() => {
    const timers = loadTimers()
    timers[day] = { ...state, _startedAt: startedAtRef.current } as any
    saveTimers(timers)
  }, [state, day])

  const start = useCallback((durationSeconds: number, label: string) => {
    startedAtRef.current = Date.now()
    setState({ timeLeft: durationSeconds, status: 'running', duration: durationSeconds, label })
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [])

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, status: 'paused' }))
  }, [])

  const resume = useCallback(() => {
    startedAtRef.current = Date.now() - (state.duration - state.timeLeft) * 1000
    setState(prev => ({ ...prev, status: 'running' }))
  }, [state.duration, state.timeLeft])

  const stop = useCallback(() => {
    setState(prev => ({ ...prev, timeLeft: prev.duration, status: 'idle' }))
  }, [])

  const display = formatTimer(state.timeLeft)
  const progress = state.duration > 0
    ? ((state.duration - state.timeLeft) / state.duration) * 100
    : 0

  return { ...state, display, progress, start, pause, resume, stop }
}
