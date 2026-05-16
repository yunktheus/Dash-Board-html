'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { StoreProvider } from '@/lib/store'
import { Navbar } from '@/components/layout/navbar'
import { useAuth } from '@/hooks/use-auth'
import { useSync } from '@/hooks/use-sync'
import type { SyncStatus } from '@/types'

function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { status } = useSync(user)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const saved = localStorage.getItem('studium_theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
    // Light mode is the default — only override if user previously saved a preference
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('studium_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return (
    <>
      <Navbar syncStatus={status as SyncStatus} theme={theme} onThemeToggle={toggleTheme} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--text-faint)]">
        Studium — foco, constância e progresso.
      </footer>
    </>
  )
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <AppShell>{children}</AppShell>
    </StoreProvider>
  )
}
