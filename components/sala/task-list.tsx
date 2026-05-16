'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Check, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useDispatch, useAppState } from '@/lib/store'
import type { Day } from '@/types'

interface TaskListProps {
  day: Day
}

export function TaskList({ day }: TaskListProps) {
  const dispatch = useDispatch()
  const { tasks } = useAppState()
  const dayTasks = tasks[day]
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTask = () => {
    const text = newText.trim()
    if (!text) return
    dispatch({ type: 'ADD_TASK', day, text })
    setNewText('')
  }

  const startEdit = (id: string, text: string) => {
    setEditingId(id)
    setEditText(text)
  }

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      dispatch({ type: 'UPDATE_TASK', day, taskId: editingId, text: editText.trim() })
    }
    setEditingId(null)
  }

  return (
    <div className="flex flex-col gap-2">
      {dayTasks.map(task => (
        <div key={task.id} className="group flex items-start gap-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_TASK', day, taskId: task.id })}
            className={cn(
              'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
              task.done
                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                : 'border-[var(--border-strong)] hover:border-[var(--accent)]'
            )}
            aria-label={task.done ? 'Desmarcar tarefa' : 'Marcar tarefa'}
          >
            {task.done && <Check className="size-2.5" />}
          </button>

          {editingId === task.id ? (
            <input
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={e => {
                if (e.key === 'Enter') saveEdit()
                if (e.key === 'Escape') setEditingId(null)
              }}
              className="flex-1 rounded border border-[var(--accent)] bg-[var(--surface)] px-1.5 py-0.5 text-sm text-[var(--text)] outline-none"
            />
          ) : (
            <span
              className={cn(
                'flex-1 text-sm leading-5 transition-colors',
                task.done ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text)]'
              )}
            >
              {task.text}
            </span>
          )}

          <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => startEdit(task.id, task.text)}
              className="p-0.5 rounded text-[var(--text-faint)] hover:text-[var(--text)]"
              aria-label="Editar"
            >
              <Pencil className="size-3" />
            </button>
            <button
              onClick={() => dispatch({ type: 'DELETE_TASK', day, taskId: task.id })}
              className="p-0.5 rounded text-[var(--text-faint)] hover:text-red-500"
              aria-label="Excluir"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        </div>
      ))}

      {/* Add task */}
      <div className="flex gap-1.5 mt-1">
        <input
          ref={inputRef}
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Nova tarefa..."
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
        />
        <Button variant="outline" size="icon" onClick={addTask} aria-label="Adicionar">
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
