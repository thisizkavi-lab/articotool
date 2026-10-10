import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const SITE_DESCRIPTION =
  'Study how great speakers think out loud. Shadow curated clips from Naval, 3Blue1Brown and more, or any YouTube video. Record yourself and compare. Recordings stay in your browser.'

export const metadata: Metadata = {
  metadataBase: new URL('https://articotool.vercel.app'),
  title: 'artiCO shadowing tool',
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: 'artiCO',
    title: 'artiCO: shadow great speakers',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: 'artiCO: shadow great speakers',
    description: SITE_DESCRIPTION,
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
