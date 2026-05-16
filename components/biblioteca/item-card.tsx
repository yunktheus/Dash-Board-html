'use client'

import { ExternalLink, Trash2, FileText, Link2, Image as ImageIcon, File, BookOpen, StickyNote } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDispatch } from '@/lib/store'
import { DAY_SHORT } from '@/lib/utils'
import type { LibraryItem, Day } from '@/types'

const TYPE_ICON: Record<string, React.ElementType> = {
  link: Link2,
  pdf: FileText,
  doc: BookOpen,
  note: StickyNote,
  image: ImageIcon,
  file: File,
}

const TYPE_LABEL: Record<string, string> = {
  link: 'Link',
  pdf: 'PDF',
  doc: 'Documento',
  note: 'Nota',
  image: 'Imagem',
  file: 'Arquivo',
}

interface ItemCardProps {
  item: LibraryItem
  onDelete?: (storagePath?: string) => void
}

export function ItemCard({ item, onDelete }: ItemCardProps) {
  const dispatch = useDispatch()
  const Icon = TYPE_ICON[item.tipo] ?? File

  const handleDelete = () => {
    dispatch({ type: 'DELETE_BIBLIOTECA_ITEM', itemId: item.id, storagePath: item.storagePath })
    onDelete?.(item.storagePath)
  }

  const dateStr = format(new Date(item.addedAt), "d MMM yyyy", { locale: ptBR })
  const dayLabel = (DAY_SHORT as Record<string, string>)[item.dia] ?? item.dia

  return (
    <Card className="group relative flex flex-col gap-3 hover:border-[var(--accent)] transition-colors">
      {/* Image preview */}
      {item.tipo === 'image' && (
        <div className="relative -mx-5 -mt-5 overflow-hidden rounded-t-xl">
          <img
            src={item.url}
            alt={item.titulo}
            className="w-full h-32 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-raised)]">
          <Icon className="size-4 text-[var(--text-muted)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text)] truncate">{item.titulo}</p>
          {item.originalName && (
            <p className="text-xs text-[var(--text-faint)] truncate">{item.originalName}</p>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge variant="outline">{TYPE_LABEL[item.tipo]}</Badge>
        {item.dia !== 'geral' && (
          <Badge variant="brand">{dayLabel}</Badge>
        )}
        <span className="text-[10px] text-[var(--text-faint)] ml-auto">{dateStr}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] py-1.5 text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          <ExternalLink className="size-3" />
          Abrir
        </a>
        <button
          onClick={handleDelete}
          className="flex size-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-faint)] hover:border-red-300 hover:text-red-500 transition-colors"
          aria-label="Excluir"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </Card>
  )
}
