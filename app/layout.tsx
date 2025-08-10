import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CustomThemeProvider } from '@/lib/context/ThemeContext'
import { UserProvider } from '@/lib/context/UserContext'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'DINO - Digital Nomad Visa Tracker',
  description: 'Track your visa status and stay duration across multiple countries',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <UserProvider>
          <CustomThemeProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </CustomThemeProvider>
        </UserProvider>
      </body>
    </html>
  )
}