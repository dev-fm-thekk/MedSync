// 1. REMOVE 'use client' from the very top
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import Providers from './providers' // Ensure this file HAS 'use client'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

// This is now valid because this file is a Server Component again
export const metadata: Metadata = {
  title: 'MedSync - Secure Healthcare Platform',
  description: 'Decentralized healthcare data management...',
  // ... rest of your metadata
}

export const viewport: Viewport = {
  themeColor: '#1a73e8',
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
          {/* Providers is a Client Component (Privy), 
             but it's perfectly fine to use it here. 
          */}
          <Providers>
            {children}
          </Providers>
        <Analytics />
      </body>
    </html>
  )
}