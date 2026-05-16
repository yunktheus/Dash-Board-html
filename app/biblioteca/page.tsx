'use client'

import { useState, useRef } from 'react'
import { Plus, Link2, Upload, Loader2, FolderPlus, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'
import { ItemCard } from '@/components/biblioteca/item-card'
import { useDispatch, useAppState } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'
import { useFileUpload } from '@/hooks/use-file-upload'
import { DAYS, DAY_SHORT } from '@/lib/utils'
import type { LibraryItemType, Day } from '@/types'

type Filter = 'todos' | Day | 'geral'

const FOLDER_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#db2777', '#0891b2',
]

export default function BibliotecaPage() {
  const dispatch = useDispatch()
  const { biblioteca } = useAppState()
  const { user } = useAuth()
  const { upload, remove, uploading, progress, error } = useFileUpload(user?.uid)

  const [filter, setFilter] = useState<Filter>('todos')
  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [addFolderOpen, setAddFolderOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkDay, setLinkDay] = useState<string>('geral')
  const [folderName, setFolderName] = useState('')
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0])
  const fileRef = useRef<HTMLInputElement>(null)

  const filteredItems = biblioteca.itens.filter(item => {
    if (filter === 'todos') return true
    return item.dia === filter
  })

  const handleAddLink = () => {
    const url = linkUrl.trim()
    const titulo = linkTitle.trim() || url
    if (!url) return
    dispatch({
      type: 'ADD_BIBLIOTECA_ITEM',
      item: { titulo, tipo: 'link', url, dia: linkDay },
    })
    setLinkUrl('')
    setLinkTitle('')
    setLinkDay('geral')
    setAddLinkOpen(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!user) {
      alert('Faça login para enviar arquivos para a nuvem.')
      return
    }

    try {
      const result = await upload(file)
      dispatch({
        type: 'ADD_BIBLIOTECA_ITEM',
        item: {
          titulo: file.name.replace(/\.[^.]+$/, ''),
          tipo: result.tipo,
          url: result.url,
          storagePath: result.storagePath,
          originalName: result.originalName,
          dia: 'geral',
        },
      })
    } catch (err) {
      console.error('Upload falhou:', err)
    }
  }

  const handleAddFolder = () => {
    const nome = folderName.trim()
    if (!nome) return
    dispatch({ type: 'ADD_BIBLIOTECA_FOLDER', nome, cor: folderColor })
    setFolderName('')
    setFolderColor(FOLDER_COLORS[0])
    setAddFolderOpen(false)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text)]">Biblioteca</h1>
            <p className="text-[var(--text-muted)]">Seus materiais, links e arquivos de estudo.</p>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddFolderOpen(true)}>
              <FolderPlus className="size-3.5" />
              <span className="hidden sm:inline">Pasta</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAddLinkOpen(true)}>
              <Link2 className="size-3.5" />
              <span className="hidden sm:inline">Link</span>
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={() => fileRef.current?.click()}
              loading={uploading}
            >
              <Upload className="size-3.5" />
              <span className="hidden sm:inline">{uploading ? `${progress}%` : 'Upload'}</span>
            </Button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {/* Folders */}
      {biblioteca.pastas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {biblioteca.pastas.map(pasta => (
            <div
              key={pasta.id}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 hover:border-[var(--accent)] transition-colors cursor-pointer group"
            >
              <div className="size-4 rounded" style={{ backgroundColor: pasta.cor }} />
              <span className="text-sm text-[var(--text)]">{pasta.nome}</span>
              <button
                onClick={() => dispatch({ type: 'DELETE_BIBLIOTECA_FOLDER', folderId: pasta.id })}
                className="ml-1 text-[var(--text-faint)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Filter className="size-3.5 text-[var(--text-faint)]" />
        {(['todos', ...DAYS, 'geral'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {f === 'todos' ? 'Todos' : f === 'geral' ? 'Geral' : (DAY_SHORT as Record<string, string>)[f]}
          </button>
        ))}
        <span className="ml-auto text-xs text-[var(--text-faint)]">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
        </span>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center border-dashed">
          <div className="flex size-12 items-center justify-center rounded-full bg-[var(--surface-raised)]">
            <Upload className="size-6 text-[var(--text-faint)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--text)]">Nenhum material ainda</p>
            <p className="text-sm text-[var(--text-muted)]">Adicione links, PDFs ou imagens para começar.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAddLinkOpen(true)}>
              <Link2 className="size-3.5" />
              Adicionar link
            </Button>
            <Button variant="solid" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="size-3.5" />
              Fazer upload
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={storagePath => storagePath && remove(storagePath)}
            />
          ))}
        </div>
      )}

      {/* Add link modal */}
      <Modal open={addLinkOpen} onClose={() => setAddLinkOpen(false)} title="Adicionar link" size="sm">
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            placeholder="URL (https://...)"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <input
            value={linkTitle}
            onChange={e => setLinkTitle(e.target.value)}
            placeholder="Título (opcional)"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Dia da semana</label>
            <select
              value={linkDay}
              onChange={e => setLinkDay(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
            >
              <option value="geral">Geral</option>
              {DAYS.map(d => (
                <option key={d} value={d}>{(DAY_SHORT as Record<string, string>)[d]}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddLinkOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddLink}>Adicionar</Button>
          </div>
        </div>
      </Modal>

      {/* Add folder modal */}
      <Modal open={addFolderOpen} onClose={() => setAddFolderOpen(false)} title="Nova pasta" size="sm">
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
            placeholder="Nome da pasta"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-2 block">Cor</label>
            <div className="flex gap-2 flex-wrap">
              {FOLDER_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setFolderColor(c)}
                  className={`size-7 rounded-full transition-transform ${folderColor === c ? 'scale-125 ring-2 ring-offset-2 ring-[var(--accent)]' : ''}`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setAddFolderOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddFolder}>Criar pasta</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
