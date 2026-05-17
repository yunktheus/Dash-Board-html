'use client'

import { useState, useRef } from 'react'
import { Link2, Upload, FolderPlus, Filter, Folder, ChevronLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { ItemCard } from '@/components/biblioteca/item-card'
import { useDispatch, useAppState } from '@/lib/store'
import { useAuth } from '@/hooks/use-auth'
import { useFileUpload } from '@/hooks/use-file-upload'
import { DAYS, DAY_SHORT, DAY_LABELS } from '@/lib/utils'
import type { Day } from '@/types'

type DayFilter = 'todos' | Day

const FOLDER_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#db2777', '#0891b2',
]

export default function BibliotecaPage() {
  const dispatch = useDispatch()
  const { biblioteca } = useAppState()
  const { user } = useAuth()
  const { upload, remove, uploading, progress, error } = useFileUpload(user?.uid)

  // Filters
  const [dayFilter, setDayFilter] = useState<DayFilter>('todos')
  const [openFolderId, setOpenFolderId] = useState<string | null>(null)

  // Modals
  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [addFolderOpen, setAddFolderOpen] = useState(false)

  // Link form
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkDay, setLinkDay] = useState<Day>('segunda')

  // Folder form
  const [folderName, setFolderName] = useState('')
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0])
  const [folderDay, setFolderDay] = useState<Day>('segunda')

  const fileRef = useRef<HTMLInputElement>(null)
  // Day assigned to the next uploaded file (resolved before the file dialog opens)
  const uploadTargetDay = useRef<Day>('segunda')

  // Upload day picker — shown when uploading from the "Todos" view
  const [uploadDayModalOpen, setUploadDayModalOpen] = useState(false)
  const [uploadDay, setUploadDay] = useState<Day>('segunda')

  // Which folder is currently open?
  const openFolder = openFolderId
    ? biblioteca.pastas.find(p => p.id === openFolderId) ?? null
    : null

  // The day new items/folders are assigned to.
  // Inside a folder → the folder's day. Otherwise → the active day filter
  // (defaults to "segunda" when viewing "Todos").
  const contextDay: Day = openFolder
    ? (DAYS.includes(openFolder.dia as Day) ? (openFolder.dia as Day) : 'segunda')
    : dayFilter === 'todos'
      ? 'segunda'
      : dayFilter

  // Show a day picker in modals only when there's no day context yet.
  const needsDayPicker = !openFolder && dayFilter === 'todos'

  // Items to show
  const visibleItems = biblioteca.itens.filter(item => {
    if (openFolderId) return item.folderId === openFolderId
    if (item.folderId) return false // foldered items only appear inside their folder
    if (dayFilter === 'todos') return true
    return item.dia === dayFilter
  })

  // Folders to show (filtered by day, hidden when inside a folder)
  const visibleFolders = dayFilter === 'todos'
    ? biblioteca.pastas
    : biblioteca.pastas.filter(p => p.dia === dayFilter)

  const openLinkModal = () => {
    setLinkUrl('')
    setLinkTitle('')
    setLinkDay(contextDay)
    setAddLinkOpen(true)
  }

  const openFolderModal = () => {
    setFolderName('')
    setFolderColor(FOLDER_COLORS[0])
    setFolderDay(contextDay)
    setAddFolderOpen(true)
  }

  const handleAddLink = () => {
    const url = linkUrl.trim()
    const titulo = linkTitle.trim() || url
    if (!url) return
    dispatch({
      type: 'ADD_BIBLIOTECA_ITEM',
      item: {
        titulo,
        tipo: 'link',
        url,
        dia: linkDay,
        folderId: openFolderId ?? undefined,
      },
    })
    setAddLinkOpen(false)
  }

  // Clicking "Upload": when viewing "Todos", ask which day first;
  // otherwise the day is already known from the active filter / open folder.
  const handleUploadClick = () => {
    if (needsDayPicker) {
      setUploadDay(contextDay)
      setUploadDayModalOpen(true)
    } else {
      uploadTargetDay.current = contextDay
      fileRef.current?.click()
    }
  }

  const confirmUploadDay = () => {
    uploadTargetDay.current = uploadDay
    setUploadDayModalOpen(false)
    fileRef.current?.click()
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
          dia: uploadTargetDay.current,
          folderId: openFolderId ?? undefined,
        },
      })
    } catch (err) {
      console.error('Upload falhou:', err)
    }
  }

  const handleAddFolder = () => {
    const nome = folderName.trim()
    if (!nome) return
    dispatch({ type: 'ADD_BIBLIOTECA_FOLDER', nome, cor: folderColor, dia: folderDay })
    setAddFolderOpen(false)
  }

  // Small note explaining where new items will be saved
  const destinationNote = openFolder
    ? `Será salvo na pasta "${openFolder.nome}"`
    : needsDayPicker
      ? 'Você escolhe o dia ao adicionar'
      : `Será salvo em ${DAY_LABELS[contextDay]}`

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Title */}
        <div className="flex flex-col gap-2">
          {openFolder ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpenFolderId(null)}
                className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-sm"
              >
                <ChevronLeft className="size-4" />
                Biblioteca
              </button>
              <span className="text-[var(--text-faint)]">/</span>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded" style={{ backgroundColor: openFolder.cor }} />
                <h1 className="text-3xl font-bold text-[var(--text)]">{openFolder.nome}</h1>
              </div>
            </div>
          ) : (
            <h1 className="text-3xl font-bold text-[var(--text)]">Biblioteca</h1>
          )}
          <p className="text-[var(--text-muted)]">Seus materiais, links e arquivos de estudo.</p>
        </div>

        {/* Action toolbar */}
        <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
          <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm">
            {!openFolder && (
              <Button variant="ghost" size="sm" onClick={openFolderModal}>
                <FolderPlus className="size-3.5" />
                Pasta
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={openLinkModal}>
              <Link2 className="size-3.5" />
              Link
            </Button>
            <Button
              variant="solid"
              size="sm"
              onClick={handleUploadClick}
              loading={uploading}
            >
              <Upload className="size-3.5" />
              {uploading ? `${progress}%` : 'Upload'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
              onChange={handleFileUpload}
            />
          </div>
          <p className="text-xs text-[var(--text-faint)]">{destinationNote}</p>
        </div>
      </div>

      {/* Day filters (hidden when inside a folder) */}
      {!openFolder && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="size-3.5 text-[var(--text-faint)]" />
          {(['todos', ...DAYS] as const).map(f => (
            <button
              key={f}
              onClick={() => setDayFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                dayFilter === f
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {f === 'todos' ? 'Todos' : DAY_SHORT[f]}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>
      )}

      {/* Folders (only when not inside a folder) */}
      {!openFolder && visibleFolders.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide mb-3">Pastas</p>
          <div className="flex flex-wrap gap-3">
            {visibleFolders.map(pasta => {
              const count = biblioteca.itens.filter(i => i.folderId === pasta.id).length
              const dayLabel = DAYS.includes(pasta.dia as Day)
                ? DAY_SHORT[pasta.dia as Day]
                : null
              return (
                <div
                  key={pasta.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenFolderId(pasta.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setOpenFolderId(pasta.id)
                    }
                  }}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 hover:border-[var(--accent)] hover:shadow-sm transition-all text-left outline-none focus-visible:border-[var(--accent)]"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg" style={{ backgroundColor: pasta.cor + '22' }}>
                    <Folder className="size-4" style={{ color: pasta.cor }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{pasta.nome}</p>
                    <p className="text-xs text-[var(--text-faint)]">
                      {count} {count === 1 ? 'item' : 'itens'}
                      {dayLabel && ` · ${dayLabel}`}
                    </p>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      dispatch({ type: 'DELETE_BIBLIOTECA_FOLDER', folderId: pasta.id })
                    }}
                    className="ml-2 text-[var(--text-faint)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label="Excluir pasta"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Items section */}
      <div>
        {!openFolder && (
          <p className="text-xs font-medium text-[var(--text-faint)] uppercase tracking-wide mb-3">
            Materiais
            <span className="ml-2 normal-case font-normal">({visibleItems.length})</span>
          </p>
        )}

        {visibleItems.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-12 text-center border-dashed">
            <div className="flex size-12 items-center justify-center rounded-full bg-[var(--surface-raised)]">
              <Upload className="size-6 text-[var(--text-faint)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--text)]">
                {openFolder ? `${openFolder.nome} está vazia` : 'Nenhum material ainda'}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                Use os botões acima para adicionar links, PDFs ou imagens.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleItems.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                onDelete={storagePath => storagePath && remove(storagePath)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add link modal */}
      <Modal open={addLinkOpen} onClose={() => setAddLinkOpen(false)} title="Adicionar link" size="sm">
        <div className="flex flex-col gap-3">
          <input
            autoFocus
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddLink()}
            placeholder="URL (https://...)"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          <input
            value={linkTitle}
            onChange={e => setLinkTitle(e.target.value)}
            placeholder="Título (opcional)"
            className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none focus:border-[var(--accent)] transition-colors"
          />
          {needsDayPicker ? (
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Dia da semana</label>
              <select
                value={linkDay}
                onChange={e => setLinkDay(e.target.value as Day)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                {DAYS.map(d => (
                  <option key={d} value={d}>{DAY_LABELS[d]}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-faint)]">{destinationNote}</p>
          )}
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
          {needsDayPicker ? (
            <div>
              <label className="text-xs text-[var(--text-muted)] mb-1 block">Dia da semana</label>
              <select
                value={folderDay}
                onChange={e => setFolderDay(e.target.value as Day)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
              >
                {DAYS.map(d => (
                  <option key={d} value={d}>{DAY_LABELS[d]}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs text-[var(--text-faint)]">{destinationNote}</p>
          )}
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

      {/* Upload day picker — shown when uploading from the "Todos" view */}
      <Modal open={uploadDayModalOpen} onClose={() => setUploadDayModalOpen(false)} title="Enviar arquivo" size="sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--text-muted)]">
            Em qual dia da semana esse arquivo deve ficar?
          </p>
          <div>
            <label className="text-xs text-[var(--text-muted)] mb-1 block">Dia da semana</label>
            <select
              autoFocus
              value={uploadDay}
              onChange={e => setUploadDay(e.target.value as Day)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] transition-colors"
            >
              {DAYS.map(d => (
                <option key={d} value={d}>{DAY_LABELS[d]}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setUploadDayModalOpen(false)}>Cancelar</Button>
            <Button onClick={confirmUploadDay}>Escolher arquivo</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
