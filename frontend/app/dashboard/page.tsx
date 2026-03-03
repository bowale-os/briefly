'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, ChevronDown, Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { useAuthStore, useBriefingStore } from '@/store/useBriefingStore'
import { briefingsAPI } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPersonaEmoji, getPersonaColor } from '@/lib/utils'

const FREE_LIMIT = 2

const personas = [
  { id: 'streetwise', name: 'Streetwise', desc: 'Real talk, no BS' },
  { id: 'optimist', name: 'Optimist', desc: 'See the bright side' },
  { id: 'skeptic', name: 'Skeptic', desc: 'Question everything' },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, initAuth } = useAuthStore()
  const { briefings, setBriefings, addBriefing } = useBriefingStore()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const [selectedPersona, setSelectedPersona] = useState('streetwise')
  const [isFocused, setIsFocused] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const { isLoading: briefingsLoading } = useQuery({
    queryKey: ['briefings', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const data = await briefingsAPI.getBriefings(user.id)
      setBriefings(data)
      return data
    },
    enabled: !!user?.id,
  })

  const createMutation = useMutation({
    mutationFn: briefingsAPI.createBriefing,
    onSuccess: (newBriefing) => {
      addBriefing(newBriefing)
      queryClient.invalidateQueries({ queryKey: ['briefings'] })
      setQuery('')
      router.push(`/player/${newBriefing.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || createMutation.isPending) return
    createMutation.mutate({ query: query.trim(), persona: selectedPersona })
  }

  const selectedPersonaData = personas.find(p => p.id === selectedPersona) || personas[0]
  const usedCount = briefings.length
  const atLimit = usedCount >= FREE_LIMIT

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/5">
      <Sidebar currentPage="dashboard" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-3xl">

            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center"
            >
              <h1 className="text-5xl font-bold mb-3">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
              </h1>
              <p className="text-xl text-muted-foreground">
                What would you like to learn about today?
              </p>
            </motion.div>

            {/* Usage Counter */}
            {!briefingsLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-6 flex items-center justify-center gap-3"
              >
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 border border-border text-sm">
                  <div className="flex gap-1.5">
                    {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i < usedCount ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {usedCount} of {FREE_LIMIT} free briefings used
                  </span>
                </div>
              </motion.div>
            )}

            {/* Main Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {atLimit ? (
                /* Limit Reached State */
                <Card className="p-8 text-center space-y-4 border-dashed">
                  <div className="flex justify-center">
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">You've used both free briefings</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                      Thanks for trying Briefly! Head to your history to replay what you've heard,
                      or let us know what you think.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button variant="outline" onClick={() => router.push('/history')}>
                      View my briefings
                    </Button>
                  </div>
                </Card>
              ) : (
                /* Create Briefing Form */
                <Card className={`p-8 transition-all duration-300 ${
                  isFocused ? 'ring-2 ring-primary shadow-xl' : 'shadow-md'
                }`}>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Query Input */}
                    <div className="relative">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Ask me anything... like 'What's happening with AI regulation?' or 'Should I invest in crypto?'"
                        disabled={createMutation.isPending}
                        rows={4}
                        className="w-full px-5 py-4 bg-muted/50 border-0 rounded-xl resize-none focus:outline-none focus:bg-muted text-lg placeholder:text-muted-foreground/60"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Sparkles className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    </div>

                    {/* Narrator Selector */}
                    <div className="space-y-3 relative">
                      <label className="text-sm font-medium">Narrator</label>

                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={createMutation.isPending}
                        className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-all bg-card flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{
                              backgroundColor: `${getPersonaColor(selectedPersona)}20`,
                              border: `2px solid ${getPersonaColor(selectedPersona)}40`,
                            }}
                          >
                            {getPersonaEmoji(selectedPersona)}
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">{selectedPersonaData.name}</div>
                            <div className="text-sm text-muted-foreground">{selectedPersonaData.desc}</div>
                          </div>
                        </div>
                        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-50 w-full mt-2 bg-card border-2 border-border rounded-xl shadow-xl overflow-hidden"
                          >
                            <div className="max-h-[400px] overflow-y-auto">
                              {personas.map((persona, index) => {
                                const isSelected = selectedPersona === persona.id
                                const color = getPersonaColor(persona.id)
                                return (
                                  <motion.button
                                    key={persona.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedPersona(persona.id)
                                      setIsDropdownOpen(false)
                                    }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-accent transition-colors ${
                                      isSelected ? 'bg-accent' : ''
                                    }`}
                                  >
                                    <div
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                                      style={{
                                        backgroundColor: `${color}20`,
                                        border: `2px solid ${color}40`,
                                      }}
                                    >
                                      {getPersonaEmoji(persona.id)}
                                    </div>
                                    <div className="flex-1 text-left">
                                      <div className="font-semibold text-sm">{persona.name}</div>
                                      <div className="text-xs text-muted-foreground">{persona.desc}</div>
                                    </div>
                                    {isSelected && (
                                      <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: color }}
                                      >
                                        <Check className="h-4 w-4 text-white" />
                                      </div>
                                    )}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={!query.trim() || createMutation.isPending}
                      size="lg"
                      className="w-full h-14 text-lg font-semibold"
                    >
                      {createMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating your briefing...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Generate Briefing
                          <span className="ml-2 text-sm font-normal opacity-60">
                            ({FREE_LIMIT - usedCount} left)
                          </span>
                        </>
                      )}
                    </Button>
                  </form>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
