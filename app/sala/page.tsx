'use client'

import { useState, useRef } from 'react'
import { Pencil, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { DayCard } from '@/components/sala/day-card'
import { ResourcesSection } from '@/components/sala/resources-section'
import { useDispatch, useAppState } from '@/lib/store'
import { DAYS, calcProgress } from '@/lib/utils'
import type { AppData } from '@/types'

export default function SalaPage() {
  const dispatch = useDispatch()
  const state = useAppState()
  const { tasks, pageTitle } = state

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState(pageTitle)
  const fileRef = useRef<HTMLInputElement>(null)

  const progress = calcProgress(tasks)

  const saveTitle = () => {
    const t = titleDraft.trim()
    if (t) dispatch({ type: 'SET_PAGE_TITLE', payload: t })
    setEditingTitle(false)
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studium_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const data = JSON.parse(evt.target?.result as string) as Partial<AppData>
        dispatch({ type: 'IMPORT', payload: data })
      } catch {
        alert('Arquivo inválido.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {editingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveTitle()
                  if (e.key === 'Escape') setEditingTitle(false)
                }}
                className="text-3xl font-bold bg-transparent border-b-2 border-[var(--accent)] text-[var(--text)] outline-none w-full max-w-sm"
              />
            ) : (
              <button
                onClick={() => { setTitleDraft(pageTitle); setEditingTitle(true) }}
                className="flex items-center gap-2 text-3xl font-bold text-[var(--text)] hover:opacity-70 transition-opacity group text-left"
              >
                {pageTitle}
                <Pencil className="size-5 opacity-0 group-hover:opacity-100 text-[var(--text-muted)] transition-opacity" />
              </button>
            )}
            <p className="text-[var(--text-muted)]">Suas tarefas e sessões de foco desta semana.</p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="ghost" size="sm" onClick={exportData}>
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="size-3.5" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importData} />
          </div>
        </div>

        {/* Overall progress */}
        <div className="flex items-center gap-3">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium text-[var(--text-muted)] shrink-0">{progress}%</span>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {DAYS.map(day => (
          <DayCard key={day} day={day} />
        ))}
      </div>

      {/* Resources */}
      <div className="border-t border-[var(--border)] pt-8">
        <ResourcesSection />
      </div>
    </div>
  )
}
