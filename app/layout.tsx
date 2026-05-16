import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Studium — Seu espaço de estudos',
    template: '%s | Studium',
  },
  description:
    'Studium é seu dashboard de estudos pessoal. Organize tarefas por semana, use o timer Pomodoro, registre sua frequência e centralize seus materiais.',
  keywords: ['estudos', 'pomodoro', 'produtividade', 'tarefas', 'biblioteca', 'foco'],
  authors: [{ name: 'Studium' }],
  openGraph: {
    title: 'Studium — Seu espaço de estudos',
    description: 'Dashboard de estudos com timer Pomodoro, tarefas semanais e biblioteca de materiais.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary',
    title: 'Studium',
    description: 'Dashboard pessoal de estudos com Pomodoro, tarefas e biblioteca.',
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0d14' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
