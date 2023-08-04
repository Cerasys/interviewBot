import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from './components/Analytics'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Persona AI',
  description: 'Identify top candidates with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Analytics />
      <body className={inter.className}>{children}</body>
    </html>
  )
}
