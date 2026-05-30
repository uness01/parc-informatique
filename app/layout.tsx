import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "GPI — Ministère de la Transition Énergétique",
  description: "Gestion du Parc Informatique — Ministère de la Transition Énergétique et du Développement Durable",
  icons: {
    icon: '/logo-maroc.png',
    shortcut: '/logo-maroc.png',
    apple: '/logo-maroc.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
