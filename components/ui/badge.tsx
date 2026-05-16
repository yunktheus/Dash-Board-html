import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        {
          default: 'bg-[var(--surface-raised)] text-[var(--text-muted)]',
          brand: 'bg-[var(--accent-subtle)] text-[var(--accent)]',
          success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
          warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
          danger: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
          outline: 'border border-[var(--border)] text-[var(--text-muted)]',
        }[variant],
        className
      )}
      {...props}
    />
  )
}
