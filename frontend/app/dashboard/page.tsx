'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, ChevronDown, Check, Lock, Volume2, FileText, Layers, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { useAuthStore, useBriefingStore } from '@/store/useBriefingStore'
import { briefingsAPI, OutputMode } from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPersonaEmoji, getPersonaColor } from '@/lib/utils'

const FREE_AUDIO_LIMIT = 3

// These match the backend PERSONAS dict exactly (persona.py)
const PERSONAS = [
  {
    id: 'analyst',
    name: 'Calm Analyst',
    desc: 'Structured, neutral, data-first explanations.',
  },
  {
    id: 'journalist',
    name: 'TV Journalist',
    desc: 'On-the-ground reporter with vivid but factual storytelling.',
  },
  {
    id: 'streetwise',
    name: 'Streetwise Friend',
    desc: 'Relatable friend who explains the news in everyday language.',
  },
  {
    id: 'informant',
    name: 'Insider Informant',
    desc: 'Highlights power dynamics and behind-the-scenes context.',
  },
  {
    id: 'colleague',
    name: 'Colleague Over Coffee',
    desc: 'Smart coworker who keeps you up to speed on the world.',
  },
]

// The three output options the user can choose from
const OUTPUT_MODES: { id: OutputMode; label: string; desc: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'audio',   label: 'Audio',   desc: 'Voice briefing only',         Icon: Volume2   },
  { id: 'summary', label: 'Summary', desc: 'Written summary only',        Icon: FileText  },
  { id: 'both',    label: 'Both',    desc: 'Audio + written summary',     Icon: Layers    },
]

export default function DashboardPage() {
  const router = useRouter()
  const { user, initAuth } = useAuthStore()
  const { briefings, setBriefings, addBriefing } = useBriefingStore()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const [selectedPersona, setSelectedPersona] = useState('analyst')
  const [selectedOutputMode, setSelectedOutputMode] = useState<OutputMode>('both')
  const [isFocused, setIsFocused] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

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
      setCreateError(null)
      addBriefing(newBriefing)
      queryClient.invalidateQueries({ queryKey: ['briefings'] })
      setQuery('')
      router.push(`/player/${newBriefing.id}`)
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setCreateError(detail ?? 'Something went wrong. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || createMutation.isPending) return
    createMutation.mutate({
      query: query.trim(),
      persona: selectedPersona,
      output_mode: selectedOutputMode,
    })
  }

  const selectedPersonaData = PERSONAS.find(p => p.id === selectedPersona) || PERSONAS[0]
  // Only audio/both briefings count toward the free cap; summaries are always free
  const audioUsedCount = briefings.filter(b => b.output_mode === 'audio' || b.output_mode === 'both').length
  const atAudioLimit = audioUsedCount >= FREE_AUDIO_LIMIT
  // Block the form when audio is requested and the cap is hit
  const atLimit = atAudioLimit && selectedOutputMode !== 'summary'

  return (
    <div className="flex h-screen overflow-hidden page-bg">
      <Sidebar currentPage="dashboard" />

      <main className="flex-1 overflow-y-auto">
        {/* min-h-full + flex centering: vertically centers when content is short,
            scrolls naturally when content is taller than the viewport */}
        <div className="flex min-h-full items-center justify-center px-8 py-4">
          <div className="w-full max-w-2xl">

            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-center"
            >
              <h1 className="text-3xl font-bold mb-1.5">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
              </h1>
              <p className="text-base text-muted-foreground">
                What would you like to learn about today?
              </p>
            </motion.div>

            {/* Usage Counter */}
            {!briefingsLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-3 flex items-center justify-center gap-3"
              >
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-muted/60 border border-border text-sm">
                  <div className="flex gap-1.5">
                    {/* dots */}
                    {Array.from({ length: FREE_AUDIO_LIMIT }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i < audioUsedCount ? 'bg-primary' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground whitespace-nowrap">{audioUsedCount} of {FREE_AUDIO_LIMIT} free audio briefings used</span>
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
                    <h2 className="text-xl font-semibold mb-2">You've used all {FREE_AUDIO_LIMIT} free audio briefings</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                      Switch to <strong>Summary</strong> mode to keep generating written briefings for free,
                      or head to your history to replay what you've heard.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Button onClick={() => router.push('/history')} variant="outline">
                      View my briefings
                    </Button>
                  </div>
                </Card>
              ) : (
                /* Create Briefing Form */
                <Card className={`p-5 transition-all duration-300 ${
                  isFocused ? 'ring-2 ring-primary shadow-xl' : 'shadow-md'
                }`}>
                  <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Query Input */}
                    <div className="relative">
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Ask me anything... like 'What's happening with AI regulation?' or 'Should I invest in crypto?'"
                        disabled={createMutation.isPending}
                        rows={3}
                        className="w-full px-4 py-3 bg-muted/50 border-0 rounded-xl resize-none focus:outline-none focus:bg-muted text-base placeholder:text-muted-foreground/60"
                      />
                      <div className="absolute bottom-4 right-4">
                        <Sparkles className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    </div>

                    {/* Narrator Dropdown */}
                    <div className="space-y-2 relative">
                      <label className="text-sm font-medium text-muted-foreground">Narrator</label>

                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        disabled={createMutation.isPending}
                        className="w-full p-3 rounded-xl border-2 border-border hover:border-primary/50 transition-all bg-card flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar — solid border + tinted fill so it's clearly visible */}
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                            style={{
                              backgroundColor: `${getPersonaColor(selectedPersona)}22`,
                              border: `2.5px solid ${getPersonaColor(selectedPersona)}`,
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
                            className="absolute z-50 w-full mt-2 bg-popover/95 backdrop-blur
 border-2 border-border rounded-xl shadow-xl overflow-hidden"
                          >
                            <div className="max-h-64 overflow-y-auto">
                              {PERSONAS.map((persona, index) => {
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
                                    className="w-full p-4 flex items-center gap-3 transition-colors hover:bg-muted"
                                    style={{
                                      // Selected rows get a clear tinted background + left accent bar
                                      backgroundColor: isSelected ? `${color}18` : undefined,
                                      borderLeft: isSelected ? `3px solid ${color}` : '3px solid transparent',
                                    }}
                                  >
                                    {/* Avatar — solid color border makes each persona instantly distinguishable */}
                                    <div
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                                      style={{
                                        backgroundColor: `${color}22`,
                                        border: `2px solid ${color}`,
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

                    {/* Output Mode Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Output format</label>
                      <div className="grid grid-cols-3 gap-2">
                        {OUTPUT_MODES.map(({ id, label, desc, Icon }) => {
                          const isSelected = selectedOutputMode === id
                          return (
                            <button
                              key={id}
                              type="button"
                              disabled={createMutation.isPending}
                              onClick={() => setSelectedOutputMode(id)}
                              className={`p-3 rounded-xl border-2 transition-all text-left flex flex-col gap-1 ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-muted-foreground/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : ''}`}>
                                  {label}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground leading-tight">{desc}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={!query.trim() || createMutation.isPending}
                      size="lg"
                      className="w-full h-11 text-base font-semibold"
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
                            ({FREE_AUDIO_LIMIT - audioUsedCount} left)
                          </span>
                        </>
                      )}
                    </Button>

                    {/* Inline error message */}
                    {createError && (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl border border-destructive/30 bg-destructive/5 text-sm">
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-destructive/90 leading-snug">{createError}</p>
                      </div>
                    )}

                  </form>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      {/* Close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
