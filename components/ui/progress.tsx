import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: 'sm' | 'md'
  color?: 'brand' | 'success' | 'warning'
}

export function Progress({ value, max = 100, size = 'md', color = 'brand', className, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn(
        'w-full rounded-full bg-[var(--border)] overflow-hidden',
        { sm: 'h-1', md: 'h-2' }[size],
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          {
            brand: 'bg-[var(--accent)]',
            success: 'bg-emerald-500',
            warning: 'bg-amber-500',
          }[color]
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
