'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mic2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { useAuthStore } from '@/store/useBriefingStore'
import { setAuthToken } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth, initAuth, token } = useAuthStore()
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    initAuth()
    if (token) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    }
  }, [token, initAuth, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let response
      if (isLogin) {
        response = await authAPI.login({ username: email, password })
      } else {
        response = await authAPI.signup({ email, password })
      }

      console.log('✅ Login response:', response)

      // CRITICAL: Set token in localStorage FIRST
      setAuthToken(response.access_token)
      
      // THEN set cookie for middleware
      document.cookie = `auth_token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`

      console.log('✅ Token saved, fetching user...')

      // NOW fetch user data (token is in localStorage, axios will use it)
      const userData = await authAPI.getMe()
      console.log('✅ User data:', userData)

      // Update Zustand store
      setAuth(response.access_token, userData)

      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    } catch (err: any) {
      console.error('❌ Login error:', err)
      console.error('❌ Error response:', err.response?.data)
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg"
          >
            <Mic2 className="h-12 w-12" />
          </motion.div>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">
              {isLogin ? 'Welcome back' : 'Get started'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin
                ? 'Sign in to continue to your briefings'
                : 'Create an account to start listening'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : isLogin ? (
                  'Sign in'
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <span className="font-semibold">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="font-semibold">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg"
        >
          <p className="font-medium mb-1">Demo credentials:</p>
          <p className="font-mono text-xs">test@example.com / testpass</p>
        </motion.div>
      </motion.div>
    </div>
  )
}