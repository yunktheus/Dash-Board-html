'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { useDispatch, useAppState } from '@/lib/store'
import type { Day } from '@/types'

interface NotesSectionProps {
  day: Day
}

export function NotesSection({ day }: NotesSectionProps) {
  const dispatch = useDispatch()
  const { notes } = useAppState()
  const dayNotes = notes[day]
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')

  const addNote = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_NOTE', day, text: trimmed })
    setText('')
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
      >
        <ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        Notas ({dayNotes.length})
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {dayNotes.map(note => (
            <div key={note.id} className="group relative rounded-lg bg-[var(--surface-raised)] p-2.5 text-xs text-[var(--text)]">
              <p className="leading-5 whitespace-pre-wrap">{note.text}</p>
              <p className="mt-1 text-[10px] text-[var(--text-faint)]">
                {format(new Date(note.createdAt), "d MMM 'às' HH:mm", { locale: ptBR })}
              </p>
              <button
                onClick={() => dispatch({ type: 'DELETE_NOTE', day, noteId: note.id })}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-red-500 transition-all"
                aria-label="Excluir nota"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}

          <div className="flex gap-1.5">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && e.ctrlKey) addNote()
              }}
              placeholder="Adicionar nota... (Ctrl+Enter para salvar)"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-xs text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
            />
            <Button variant="outline" size="icon" onClick={addNote} aria-label="Salvar nota">
              <Plus className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
