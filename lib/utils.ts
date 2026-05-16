import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Day, LibraryItemType, TasksData, NotesData, ResourcesData, BibliotecaData, FrequenciaData } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const DAYS: Day[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta']

export const DAY_LABELS: Record<Day, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta',
}

export const DAY_SHORT: Record<Day, string> = {
  segunda: 'Seg',
  terca: 'Ter',
  quarta: 'Qua',
  quinta: 'Qui',
  sexta: 'Sex',
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function formatDate(date: Date): string {
  return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function getDateKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

export function parseDate(dateKey: string): Date {
  return parseISO(dateKey)
}

export function isTodayCheckedIn(registros: string[]): boolean {
  const today = getDateKey()
  return registros.includes(today)
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function getLibraryItemIcon(tipo: LibraryItemType): string {
  const icons: Record<LibraryItemType, string> = {
    link: '🔗',
    pdf: '📄',
    doc: '📝',
    note: '🗒️',
    image: '🖼️',
    file: '📁',
  }
  return icons[tipo]
}

export function detectFileType(filename: string): LibraryItemType {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (['pdf'].includes(ext)) return 'pdf'
  if (['doc', 'docx', 'odt', 'rtf', 'txt'].includes(ext)) return 'doc'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image'
  return 'file'
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]

export const MAX_FILE_SIZE = 20 * 1024 * 1024

export function calcProgress(tasks: TasksData): number {
  const all = DAYS.flatMap(d => tasks[d])
  if (all.length === 0) return 0
  return Math.round((all.filter(t => t.done).length / all.length) * 100)
}

export function calcStreak(registros: string[]): number {
  if (registros.length === 0) return 0
  const sorted = [...registros].sort((a, b) => b.localeCompare(a))
  const today = getDateKey()
  const yesterday = getDateKey(new Date(Date.now() - 86400000))
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 0
  let check = sorted[0] === today ? today : yesterday
  for (const date of sorted) {
    if (date === check) {
      streak++
      const prev = new Date(parseISO(check).getTime() - 86400000)
      check = format(prev, 'yyyy-MM-dd')
    } else {
      break
    }
  }
  return streak
}

export function calcWeeklyAvg(registros: string[]): number {
  if (registros.length === 0) return 0
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weeksElapsed = Math.max(1, Math.ceil((now.getTime() - startOfYear.getTime()) / (7 * 86400000)))
  const thisYear = registros.filter(r => r.startsWith(String(now.getFullYear())))
  return Math.round((thisYear.length / weeksElapsed) * 10) / 10
}

export function getDefaultTasks(day: Day): import('@/types').Task[] {
  const templates: Partial<Record<Day, string[]>> = {
    segunda: ['Revisar conteúdo da semana', 'Leitura programada'],
    sexta: ['Revisão semanal', 'Planejar próxima semana'],
  }
  return (templates[day] ?? []).map(text => ({ id: generateId(), text, done: false }))
}

export const DEFAULT_TASKS_DATA = (): TasksData => ({
  segunda: getDefaultTasks('segunda'),
  terca: getDefaultTasks('terca'),
  quarta: getDefaultTasks('quarta'),
  quinta: getDefaultTasks('quinta'),
  sexta: getDefaultTasks('sexta'),
})

export const DEFAULT_NOTES_DATA = (): NotesData => ({
  segunda: [],
  terca: [],
  quarta: [],
  quinta: [],
  sexta: [],
})

export const DEFAULT_RESOURCES_DATA = (): ResourcesData => ({
  geral: { title: 'Geral', items: [] },
  materiais: { title: 'Materiais', items: [] },
})

export const DEFAULT_BIBLIOTECA_DATA = (): BibliotecaData => ({
  pastas: [],
  itens: [],
})

export const DEFAULT_FREQUENCIA_DATA = (): FrequenciaData => ({
  registros: [],
})
