'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mic2, Home, Clock, LogOut, Moon, Sun, ChevronRight, User, GripVertical } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { useAuthStore, useBriefingStore } from '@/store/useBriefingStore'
import { formatDate, getPersonaEmoji, cn } from '@/lib/utils'
import { useState, useRef, useEffect } from 'react'

interface SidebarProps {
  currentPage?: 'dashboard' | 'history'
}

export function Sidebar({ currentPage = 'dashboard' }: SidebarProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { user, clearAuth } = useAuthStore()
  const { briefings } = useBriefingStore()
  
  const [sidebarWidth, setSidebarWidth] = useState(320) // 320px = 80 * 4 (w-80)
  const [isResizing, setIsResizing] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)

  const handleLogout = () => {
    console.log('🔵 Logging out...')
    
    // Clear Zustand store
    clearAuth()
    
    // Clear localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    
    // Clear cookie
    document.cookie = 'auth_token=; path=/; max-age=0'
    
    console.log('✅ Logged out, redirecting to login...')
    
    // Redirect to login
    router.push('/login')
  }

  const startResizing = () => {
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const newWidth = e.clientX
      if (newWidth >= 240 && newWidth <= 500) {
        setSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  return (
    <>
      <aside 
        ref={sidebarRef}
        className="border-r bg-card/50 backdrop-blur-sm flex flex-col h-screen relative"
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground p-2.5 rounded-xl shadow-lg">
              <Mic2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Briefly</h1>
              <p className="text-xs text-muted-foreground">Audio News</p>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Logged in</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            <Button
              variant={currentPage === 'dashboard' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => router.push('/dashboard')}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              variant={currentPage === 'history' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => router.push('/history')}
            >
              <Clock className="h-4 w-4 mr-2" />
              All Briefings
            </Button>
          </nav>
        </div>

        {/* Recent Briefings */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground">RECENT</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/history')}
              className="h-6 px-2 text-xs"
            >
              View all
            </Button>
          </div>

          <div className="space-y-2">
            {briefings.slice(0, 10).map((briefing) => (
              <motion.button
                key={briefing.id}
                onClick={() => router.push(`/player/${briefing.id}`)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all",
                  "hover:bg-accent hover:shadow-sm",
                  "border border-transparent hover:border-border"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg mt-0.5 flex-shrink-0">
                    {getPersonaEmoji(briefing.persona)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2 mb-1">
                      {briefing.query}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(briefing.created_at)}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            ))}

            {briefings.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No briefings yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Resize Handle */}
        <div
          className={cn(
            "absolute top-0 right-0 w-1 h-full cursor-col-resize group hover:w-1.5 transition-all",
            isResizing ? "bg-primary w-1.5" : "bg-border hover:bg-primary/50"
          )}
          onMouseDown={startResizing}
        >
          <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-primary text-primary-foreground rounded-full p-1 shadow-lg">
              <GripVertical className="h-3 w-3" />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay when resizing */}
      {isResizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </>
  )
}