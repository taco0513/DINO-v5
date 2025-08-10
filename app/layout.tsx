import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { CustomThemeProvider } from '@/lib/context/ThemeContext'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <CustomThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </CustomThemeProvider>
      </body>
    </html>
  )
}