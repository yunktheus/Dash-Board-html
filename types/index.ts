export type Day = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta'

export interface Task {
  id: string
  text: string
  done: boolean
}

export interface Note {
  id: string
  text: string
  createdAt: string
}

export interface TimerState {
  timeLeft: number
  isRunning: boolean
  endAt: number | null
  duration: number
}

export interface Resource {
  id: string
  url: string
  label: string
}

export interface ResourceCategory {
  title: string
  items: Resource[]
}

export type LibraryItemType = 'link' | 'pdf' | 'doc' | 'note' | 'image' | 'file'

export interface LibraryFolder {
  id: string
  nome: string
  cor: string
  dia: string
  criadoEm: string
}

export interface LibraryItem {
  id: string
  titulo: string
  tipo: LibraryItemType
  url: string
  storagePath?: string
  originalName?: string
  cloudNote?: string
  addedAt: string
  dia: string
  folderId?: string
}

export interface TasksData {
  segunda: Task[]
  terca: Task[]
  quarta: Task[]
  quinta: Task[]
  sexta: Task[]
}

export interface NotesData {
  segunda: Note[]
  terca: Note[]
  quarta: Note[]
  quinta: Note[]
  sexta: Note[]
}

export interface ResourcesData {
  [key: string]: ResourceCategory
}

export interface BibliotecaData {
  pastas: LibraryFolder[]
  itens: LibraryItem[]
}

export interface FrequenciaData {
  registros: string[]
}

export interface AppData {
  tasks: TasksData
  notes: NotesData
  resources: ResourcesData
  biblioteca: BibliotecaData
  frequencia: FrequenciaData
  pageTitle: string
}

export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
