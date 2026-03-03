'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Download, SkipBack, SkipForward, Volume2, FileText, Layers, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { useAuthStore, useBriefingStore } from '@/store/useBriefingStore'
import { briefingsAPI, Briefing } from '@/lib/api'
import { getPersonaEmoji, getPersonaColor, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

// Small badge that shows what format was generated
const OUTPUT_MODE_LABELS = {
  audio:   { label: 'Audio',   Icon: Volume2  },
  summary: { label: 'Summary', Icon: FileText },
  both:    { label: 'Both',    Icon: Layers   },
}

export default function PlayerPage() {
  const router = useRouter()
  const params = useParams()
  const { user, initAuth } = useAuthStore()
  const { briefings, setBriefings } = useBriefingStore()
  const [currentBriefing, setCurrentBriefing] = useState<Briefing | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)
  const [audioError, setAudioError] = useState(false)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const { isLoading, error } = useQuery({
    queryKey: ['briefings', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const data = await briefingsAPI.getBriefings(user.id)
      setBriefings(data)
      return data
    },
    enabled: !!user?.id,
  })

  useEffect(() => {
    if (briefings.length > 0 && params.id) {
      const briefing = briefings.find((b) => b.id === params.id)
      setCurrentBriefing(briefing || null)
      setAudioError(false) // reset on every navigation
    }
  }, [briefings, params.id])

  const handleNext = () => {
    if (!currentBriefing) return
    const currentIndex = briefings.findIndex((b) => b.id === currentBriefing.id)
    if (currentIndex < briefings.length - 1) {
      router.push(`/player/${briefings[currentIndex + 1].id}`)
    }
  }

  const handlePrevious = () => {
    if (!currentBriefing) return
    const currentIndex = briefings.findIndex((b) => b.id === currentBriefing.id)
    if (currentIndex > 0) {
      router.push(`/player/${briefings[currentIndex - 1].id}`)
    }
  }

  const handleShare = async () => {
    if (!currentBriefing) return
    try {
      await navigator.share({
        title: currentBriefing.query,
        text: `Check out this briefing: ${currentBriefing.query}`,
        url: window.location.href,
      })
    } catch {
      // Share cancelled or not supported — no-op
    }
  }

  const handleDownload = () => {
    if (!currentBriefing?.audio_url) return
    const link = document.createElement('a')
    link.href = currentBriefing.audio_url
    link.download = `briefing-${currentBriefing.id}.mp3`
    link.click()
  }

  // Loading / error / not-found guards
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted animate-pulse" />
            <p className="text-muted-foreground">Loading briefings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-2">Error Loading Briefing</h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Failed to load briefings'}
            </p>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </Card>
        </div>
      </div>
    )
  }

  if (briefings.length > 0 && !currentBriefing) {
    return (
      <div className="flex h-screen">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-2">Briefing Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn&apos;t find the briefing with ID: {params.id}
            </p>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </Card>
        </div>
      </div>
    )
  }

  if (!currentBriefing) {
    return (
      <div className="flex h-screen">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const personaColor = getPersonaColor(currentBriefing.persona)
  const personaEmoji = getPersonaEmoji(currentBriefing.persona)
  const hasAudio = !!currentBriefing.audio_url
  const hasSummary = !!currentBriefing.script
  // Default to "both" for old records that predate output_mode
  const outputMode = currentBriefing.output_mode || 'both'
  const outputModeInfo = OUTPUT_MODE_LABELS[outputMode] ?? OUTPUT_MODE_LABELS.both
  const currentIndex = briefings.findIndex(b => b.id === currentBriefing.id)

  return (
    <div className="flex h-screen overflow-hidden page-bg">
      <Sidebar currentPage="dashboard" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="p-8">
              <div className="space-y-6">

                {/* Header: persona + actions */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                      style={{
                        backgroundColor: `${personaColor}20`,
                        border: `2px solid ${personaColor}40`,
                      }}
                    >
                      {personaEmoji}
                    </div>
                    <div>
                      {/* Persona badge */}
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium border inline-block mb-1"
                        style={{
                          borderColor: `${personaColor}50`,
                          backgroundColor: `${personaColor}15`,
                          color: personaColor,
                        }}
                      >
                        {currentBriefing.persona.toUpperCase()}
                      </div>
                      {/* Output mode badge */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <outputModeInfo.Icon className="h-3.5 w-3.5" />
                        <span>{outputModeInfo.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(currentBriefing.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    {/* Only show download when there's audio */}
                    {hasAudio && (
                      <Button variant="ghost" size="icon" onClick={handleDownload}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Query title */}
                <div>
                  <h1 className="text-3xl font-bold leading-tight mb-2">
                    {currentBriefing.query}
                  </h1>
                  {currentBriefing.country && (
                    <p className="text-sm text-muted-foreground">
                      {currentBriefing.city && `${currentBriefing.city}, `}
                      {currentBriefing.country}
                    </p>
                  )}
                </div>

                {/* Audio player — only shown when audio was generated */}
                {hasAudio ? (
                  <div className="space-y-4">
                    {audioError ? (
                      /* Audio failed to load (expired URL, network error, etc.) */
                      <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-destructive mb-1">Audio unavailable</p>
                          <p className="text-muted-foreground leading-snug">
                            The audio file couldn't be loaded — the link may have expired.
                            The written transcript is still available below.
                          </p>
                        </div>
                        <button
                          onClick={() => { setAudioError(false) }}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Retry
                        </button>
                      </div>
                    ) : (
                      <audio
                        controls
                        src={currentBriefing.audio_url!}
                        className="w-full"
                        style={{ height: '54px' }}
                        onError={() => setAudioError(true)}
                      />
                    )}
                    <div className="flex gap-2 justify-center">
                      {currentIndex > 0 && (
                        <Button onClick={handlePrevious} variant="outline">
                          <SkipBack className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                      )}
                      {currentIndex < briefings.length - 1 && (
                        <Button onClick={handleNext} variant="outline">
                          Next
                          <SkipForward className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Summary-only: explain there's no audio */
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 text-muted-foreground text-sm">
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    <span>This briefing was generated as a written summary — no audio available.</span>
                  </div>
                )}

                {/* Transcript / Summary section */}
                {hasSummary && (
                  <div className="border-t pt-6">
                    {/* If output_mode is "summary", show the text expanded by default */}
                    <Button
                      variant="outline"
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="w-full"
                    >
                      {showTranscript ? 'Hide' : 'Show'}{' '}
                      {outputMode === 'summary' ? 'Summary' : 'Transcript'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Transcript / Summary expanded card */}
            {showTranscript && hasSummary && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-semibold mb-4">
                    {outputMode === 'summary' ? 'Summary' : 'Transcript'}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {currentBriefing.script}
                  </p>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
