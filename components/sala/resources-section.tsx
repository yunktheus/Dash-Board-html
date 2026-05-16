'use client'

import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Pencil } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useDispatch, useAppState } from '@/lib/store'
import { generateId } from '@/lib/utils'

export function ResourcesSection() {
  const dispatch = useDispatch()
  const { resources } = useAppState()

  const [addCatOpen, setAddCatOpen] = useState(false)
  const [newCatTitle, setNewCatTitle] = useState('')

  const [addItemOpen, setAddItemOpen] = useState<string | null>(null)
  const [newItemUrl, setNewItemUrl] = useState('')
  const [newItemLabel, setNewItemLabel] = useState('')

  const handleAddCategory = () => {
    const title = newCatTitle.trim()
    if (!title) return
    const key = title.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    dispatch({ type: 'ADD_RESOURCE_CATEGORY', key, title })
    setNewCatTitle('')
    setAddCatOpen(false)
  }

  const handleAddItem = (key: string) => {
    const url = newItemUrl.trim()
    const label = newItemLabel.trim() || url
    if (!url) return
    dispatch({ type: 'ADD_RESOURCE_ITEM', categoryKey: key, url, label })
    setNewItemUrl('')
    setNewItemLabel('')
    setAddItemOpen(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text)]">Recursos</h2>
        <Button variant="outline" size="sm" onClick={() => setAddCatOpen(true)}>
          <Plus className="size-3.5" />
          Nova categoria
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(resources).map(([key, category]) => (
          <Card key={key} elevated>
            <CardHeader>
              <CardTitle>{category.title}</CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAddItemOpen(key)}
                  aria-label="Adicionar item"
                >
                  <Plus className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch({ type: 'DELETE_RESOURCE_CATEGORY', key })}
                  aria-label="Excluir categoria"
                >
                  <Trash2 className="size-3.5 text-[var(--text-faint)] hover:text-red-500" />
                </Button>
              </div>
            </CardHeader>

            <div className="flex flex-col gap-1.5">
              {category.items.length === 0 && (
                <p className="text-xs text-[var(--text-faint)]">Nenhum item ainda.</p>
              )}
              {category.items.map(item => (
                <div key={item.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-[var(--surface-raised)] transition-colors">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-1.5 text-sm text-[var(--text)] hover:text-[var(--accent)] transition-colors truncate"
                  >
                    <ExternalLink className="size-3 shrink-0 text-[var(--text-faint)]" />
                    <span className="truncate">{item.label}</span>
                  </a>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_RESOURCE_ITEM', categoryKey: key, itemId: item.id })}
                    className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--text-faint)] hover:text-red-500 transition-all"
                    aria-label="Excluir"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Add category modal */}
      <Modal open={addCatOpen} onClose={() => setAddCatOpen(false)} title="Nova categoria" size="sm">
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={newCatTitle}
            onChange={e => setNewCatTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            placeholder="Nome da categoria"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddCatOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddCategory}>Criar</Button>
          </div>
        </div>
      </Modal>

      {/* Add item modal */}
      <Modal open={!!addItemOpen} onClose={() => setAddItemOpen(null)} title="Adicionar recurso" size="sm">
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={newItemUrl}
            onChange={e => setNewItemUrl(e.target.value)}
            placeholder="URL (https://...)"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <input
            value={newItemLabel}
            onChange={e => setNewItemLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItemOpen && handleAddItem(addItemOpen)}
            placeholder="Rótulo (opcional)"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddItemOpen(null)}>Cancelar</Button>
            <Button onClick={() => addItemOpen && handleAddItem(addItemOpen)}>Adicionar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
