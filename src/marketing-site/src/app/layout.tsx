import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '../components/Analytics'
import './globals.css'
import Header from '../components/Header'
import Footer from '../components/Footer'

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
      <body className={inter.className}>
        <Header />
        <main className="min-h-[calc(100vh-180px)] pt-7">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
