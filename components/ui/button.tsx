import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'solid', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 cursor-pointer select-none',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            solid:
              'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-[0.98] shadow-sm',
            outline:
              'border border-[var(--border-strong)] text-[var(--text)] bg-[var(--surface)] hover:border-[var(--accent)] hover:text-[var(--accent)]',
            ghost:
              'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]',
            danger:
              'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] shadow-sm',
          }[variant],
          {
            sm: 'text-xs px-3 py-1.5 rounded-md',
            md: 'text-sm px-4 py-2',
            lg: 'text-base px-6 py-2.5',
            icon: 'p-2 rounded-lg',
          }[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
export { Button }
