'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { useAuthStore, useBriefingStore } from '@/store/useBriefingStore'
import { briefingsAPI } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPersonaEmoji, getPersonaColor } from '@/lib/utils'

const personas = [
  { id: 'streetwise', name: 'Streetwise', desc: 'Real talk, no BS' },
  { id: 'optimist', name: 'Optimist', desc: 'See the bright side' },
  { id: 'skeptic', name: 'Skeptic', desc: 'Question everything' },
  // Easy to add 100+ more:
  // { id: 'academic', name: 'Academic', desc: 'Research-backed analysis' },
  // { id: 'storyteller', name: 'Storyteller', desc: 'Narrative deep-dives' },
  // { id: 'comedian', name: 'Comedian', desc: 'Funny takes on news' },
  // { id: 'analyst', name: 'Analyst', desc: 'Data-driven insights' },
  // { id: 'philosopher', name: 'Philosopher', desc: 'Deep existential takes' },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, initAuth } = useAuthStore()
  const { setBriefings, addBriefing } = useBriefingStore()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const [selectedPersona, setSelectedPersona] = useState('streetwise')
  const [isFocused, setIsFocused] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  // Fetch briefings for sidebar
  useQuery({
    queryKey: ['briefings', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const data = await briefingsAPI.getBriefings(user.id)
      setBriefings(data)
      return data
    },
    enabled: !!user?.id,
  })

  // Create briefing mutation
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
    console.log(query, selectedPersona)
    createMutation.mutate({ query: query.trim(), persona: selectedPersona })
  }

  const selectedPersonaData = personas.find(p => p.id === selectedPersona) || personas[0]

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/5">
      {/* Sidebar */}
      <Sidebar currentPage="dashboard" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-screen">
          <div className="w-full max-w-3xl">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 text-center"
            >
              <h1 className="text-5xl font-bold mb-3">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
              </h1>
              <p className="text-xl text-muted-foreground">
                What would you like to learn about today?
              </p>
            </motion.div>

            {/* Create Briefing - Modern Design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
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

                  {/* Narrator Selector - Dropdown Style */}
                  <div className="space-y-3 relative">
                    <label className="text-sm font-medium">Narrator</label>
                    
                    {/* Selected Narrator Display */}
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
                            border: `2px solid ${getPersonaColor(selectedPersona)}40`
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

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 w-full mt-2 bg-card border-2 border-border rounded-xl shadow-xl overflow-hidden"
                        >
                          <div className="max-h-[400px] overflow-y-auto">
                            {personas.map((persona, index) => {
                              const isSelected = selectedPersona === persona.id
                              const color = getPersonaColor(persona.id)
                              const emoji = getPersonaEmoji(persona.id)

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
                                      border: `2px solid ${color}40`
                                    }}
                                  >
                                    {emoji}
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
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}