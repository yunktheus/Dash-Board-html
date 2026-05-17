'use client'

import {
  createContext,
  createElement,
  useContext,
  useReducer,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  Task,
  Note,
  Day,
  ResourceCategory,
  LibraryItem,
  LibraryFolder,
} from '@/types'
import {
  DEFAULT_TASKS_DATA,
  DEFAULT_NOTES_DATA,
  DEFAULT_RESOURCES_DATA,
  DEFAULT_BIBLIOTECA_DATA,
  DEFAULT_FREQUENCIA_DATA,
  generateId,
  getDateKey,
  isTodayCheckedIn,
} from '@/lib/utils'

// ─── State ────────────────────────────────────────────────────────────────────

type State = AppData

function defaultState(): State {
  return {
    tasks: DEFAULT_TASKS_DATA(),
    notes: DEFAULT_NOTES_DATA(),
    resources: DEFAULT_RESOURCES_DATA(),
    biblioteca: DEFAULT_BIBLIOTECA_DATA(),
    frequencia: DEFAULT_FREQUENCIA_DATA(),
    pageTitle: 'Minha Sala',
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'HYDRATE'; payload: State }
  | { type: 'SET_PAGE_TITLE'; payload: string }
  | { type: 'ADD_TASK'; day: Day; text: string }
  | { type: 'TOGGLE_TASK'; day: Day; taskId: string }
  | { type: 'UPDATE_TASK'; day: Day; taskId: string; text: string }
  | { type: 'DELETE_TASK'; day: Day; taskId: string }
  | { type: 'ADD_NOTE'; day: Day; text: string }
  | { type: 'DELETE_NOTE'; day: Day; noteId: string }
  | { type: 'ADD_RESOURCE_CATEGORY'; key: string; title: string }
  | { type: 'DELETE_RESOURCE_CATEGORY'; key: string }
  | { type: 'UPDATE_RESOURCE_CATEGORY'; key: string; title: string }
  | { type: 'ADD_RESOURCE_ITEM'; categoryKey: string; url: string; label: string }
  | { type: 'DELETE_RESOURCE_ITEM'; categoryKey: string; itemId: string }
  | { type: 'ADD_BIBLIOTECA_ITEM'; item: Omit<LibraryItem, 'id' | 'addedAt'> }
  | { type: 'DELETE_BIBLIOTECA_ITEM'; itemId: string; storagePath?: string }
  | { type: 'ADD_BIBLIOTECA_FOLDER'; nome: string; cor: string; dia: string }
  | { type: 'DELETE_BIBLIOTECA_FOLDER'; folderId: string }
  | { type: 'CHECK_IN' }
  | { type: 'IMPORT'; payload: Partial<State> }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload

    case 'SET_PAGE_TITLE':
      return { ...state, pageTitle: action.payload }

    case 'ADD_TASK': {
      const task: Task = { id: generateId(), text: action.text, done: false }
      return {
        ...state,
        tasks: { ...state.tasks, [action.day]: [...state.tasks[action.day], task] },
      }
    }

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.day]: state.tasks[action.day].map(t =>
            t.id === action.taskId ? { ...t, done: !t.done } : t
          ),
        },
      }

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.day]: state.tasks[action.day].map(t =>
            t.id === action.taskId ? { ...t, text: action.text } : t
          ),
        },
      }

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.day]: state.tasks[action.day].filter(t => t.id !== action.taskId),
        },
      }

    case 'ADD_NOTE': {
      const note: Note = { id: generateId(), text: action.text, createdAt: new Date().toISOString() }
      return {
        ...state,
        notes: { ...state.notes, [action.day]: [...state.notes[action.day], note] },
      }
    }

    case 'DELETE_NOTE':
      return {
        ...state,
        notes: {
          ...state.notes,
          [action.day]: state.notes[action.day].filter(n => n.id !== action.noteId),
        },
      }

    case 'ADD_RESOURCE_CATEGORY': {
      const newCat: ResourceCategory = { title: action.title, items: [] }
      return { ...state, resources: { ...state.resources, [action.key]: newCat } }
    }

    case 'DELETE_RESOURCE_CATEGORY': {
      const next = { ...state.resources }
      delete next[action.key]
      return { ...state, resources: next }
    }

    case 'UPDATE_RESOURCE_CATEGORY':
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.key]: { ...state.resources[action.key], title: action.title },
        },
      }

    case 'ADD_RESOURCE_ITEM': {
      const item = { id: generateId(), url: action.url, label: action.label }
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.categoryKey]: {
            ...state.resources[action.categoryKey],
            items: [...state.resources[action.categoryKey].items, item],
          },
        },
      }
    }

    case 'DELETE_RESOURCE_ITEM':
      return {
        ...state,
        resources: {
          ...state.resources,
          [action.categoryKey]: {
            ...state.resources[action.categoryKey],
            items: state.resources[action.categoryKey].items.filter(i => i.id !== action.itemId),
          },
        },
      }

    case 'ADD_BIBLIOTECA_ITEM': {
      const item: LibraryItem = { ...action.item, id: generateId(), addedAt: new Date().toISOString() }
      return {
        ...state,
        biblioteca: { ...state.biblioteca, itens: [...state.biblioteca.itens, item] },
      }
    }

    case 'DELETE_BIBLIOTECA_ITEM':
      return {
        ...state,
        biblioteca: {
          ...state.biblioteca,
          itens: state.biblioteca.itens.filter(i => i.id !== action.itemId),
        },
      }

    case 'ADD_BIBLIOTECA_FOLDER': {
      const folder: LibraryFolder = {
        id: generateId(),
        nome: action.nome,
        cor: action.cor,
        dia: action.dia,
        criadoEm: new Date().toISOString(),
      }
      return {
        ...state,
        biblioteca: { ...state.biblioteca, pastas: [...state.biblioteca.pastas, folder] },
      }
    }

    case 'DELETE_BIBLIOTECA_FOLDER':
      return {
        ...state,
        biblioteca: {
          ...state.biblioteca,
          pastas: state.biblioteca.pastas.filter(p => p.id !== action.folderId),
          itens: state.biblioteca.itens.filter(i => i.folderId !== action.folderId),
        },
      }

    case 'CHECK_IN': {
      const today = getDateKey()
      if (isTodayCheckedIn(state.frequencia.registros)) return state
      return {
        ...state,
        frequencia: { registros: [...state.frequencia.registros, today] },
      }
    }

    case 'IMPORT':
      return { ...state, ...action.payload }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface StoreContextValue {
  state: State
  dispatch: React.Dispatch<Action>
}

const StoreContext = createContext<StoreContextValue>(null as unknown as StoreContextValue)

export function StoreProvider({ children }: { children: ReactNode }) {
  // Always start with defaultState so SSR and client first-render match
  const [state, dispatch] = useReducer(reducer, undefined, defaultState)
  const [isReady, setIsReady] = useState(false)

  // Hydrate from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('studium_data')
      if (saved) dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) as State })
    } catch {}
    setIsReady(true)
  }, [])

  // Persist to localStorage only after hydration to avoid overwriting saved data
  useEffect(() => {
    if (!isReady) return
    try {
      localStorage.setItem('studium_data', JSON.stringify(state))
    } catch {}
  }, [state, isReady])

  return createElement(StoreContext.Provider, { value: { state, dispatch } }, children)
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function useAppState() {
  return useStore().state
}

export function useDispatch() {
  return useStore().dispatch
}
