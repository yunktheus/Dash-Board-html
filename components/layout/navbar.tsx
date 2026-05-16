'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, LayoutDashboard, Library, Sun, Moon, Cloud, CloudOff, Loader2, User, LogIn, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import type { SyncStatus } from '@/types'

interface NavbarProps {
  syncStatus?: SyncStatus
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/sala', label: 'Sala', icon: BookOpen },
  { href: '/biblioteca', label: 'Biblioteca', icon: Library },
]

function SyncIndicator({ status }: { status: SyncStatus }) {
  if (status === 'idle' || status === 'offline') return null
  return (
    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
      {status === 'syncing' && <Loader2 className="size-3 animate-spin" />}
      {status === 'synced' && <Cloud className="size-3 text-emerald-500" />}
      {status === 'error' && <CloudOff className="size-3 text-red-500" />}
    </span>
  )
}

export function Navbar({ syncStatus = 'idle', theme, onThemeToggle }: NavbarProps) {
  const pathname = usePathname()
  const { user, loading, configured, signIn, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-[var(--text)] hover:opacity-80 transition-opacity">
          <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--accent)]">
            <BookOpen className="size-4 text-white" />
          </div>
          <span className="text-base tracking-tight">Studium</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === href
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]'
              )}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <SyncIndicator status={syncStatus} />

          <Button variant="ghost" size="icon" onClick={onThemeToggle} aria-label="Alternar tema">
            {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </Button>

          {configured && !loading && (
            user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName ?? ''} className="size-7 rounded-full" />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full bg-[var(--surface-raised)]">
                    <User className="size-4 text-[var(--text-muted)]" />
                  </div>
                )}
                <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair">
                  <LogOut className="size-4" />
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={signIn}>
                <LogIn className="size-3.5" />
                Entrar
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  )
}
