'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { ReactNode, useState, useEffect } from 'react'

export default function ClientThemeProvider({ 
  children 
}: { 
  children: ReactNode 
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render nothing or neutral theme during hydration
    return <>{children}</>
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
