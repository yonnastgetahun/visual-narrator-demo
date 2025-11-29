import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Visual Narrator - Investor Demo',
  description: 'AI-powered emotionally resonant audio narrations for accessibility',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
