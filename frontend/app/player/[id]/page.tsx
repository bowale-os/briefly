'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Download, SkipBack, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sidebar } from '@/components/Sidebar'
import { useAuthStore, useBriefingStore } from '@/store/useBriefingStore'
import { briefingsAPI, Briefing } from '@/lib/api'
import { getPersonaEmoji, getPersonaColor, formatDate } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'

export default function PlayerPage() {
  const router = useRouter()
  const params = useParams()
  const { user, initAuth } = useAuthStore()
  const { briefings, setBriefings } = useBriefingStore()
  const [currentBriefing, setCurrentBriefing] = useState<Briefing | null>(null)
  const [showTranscript, setShowTranscript] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log('🔵 Player Page - params:', params)
    console.log('🔵 Player Page - params.id:', params.id)
    console.log('🔵 Player Page - user:', user)
    console.log('🔵 Player Page - briefings:', briefings)
  }, [params, user, briefings])

  useEffect(() => {
    initAuth()
  }, [initAuth])

  // Fetch briefings
  const { isLoading, error } = useQuery({
    queryKey: ['briefings', user?.id],
    queryFn: async () => {
      console.log('🟢 Fetching briefings for user:', user?.id)
      if (!user?.id) return []
      const data = await briefingsAPI.getBriefings(user.id)
      console.log('✅ Briefings fetched:', data)
      setBriefings(data)
      return data
    },
    enabled: !!user?.id,
  })

  // Find current briefing
  useEffect(() => {
    console.log('🔍 Looking for briefing with id:', params.id)
    console.log('🔍 Available briefings:', briefings.length)
    
    if (briefings.length > 0 && params.id) {
      const briefing = briefings.find((b) => b.id === params.id)
      console.log('🎯 Found briefing:', briefing)
      setCurrentBriefing(briefing || null)
      
      if (!briefing) {
        console.error('❌ Briefing not found! Available IDs:', briefings.map(b => b.id))
      }
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
    } catch (err) {
      console.log('Share cancelled or not supported')
    }
  }

  const handleDownload = () => {
    if (!currentBriefing) return
    console.log('📥 Downloading from URL:', currentBriefing.audio_url)
    const link = document.createElement('a')
    link.href = currentBriefing.audio_url
    link.download = `briefing-${currentBriefing.id}.mp3`
    link.click()
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 skeleton rounded-full animate-pulse" />
            <p className="text-muted-foreground">Loading briefings...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
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
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // Show "briefing not found" if we have briefings but can't find this one
  if (briefings.length > 0 && !currentBriefing) {
    return (
      <div className="flex h-screen">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-8 max-w-md text-center">
            <h2 className="text-xl font-semibold mb-2">Briefing Not Found</h2>
            <p className="text-muted-foreground mb-4">
              We couldn't find the briefing with ID: {params.id}
            </p>
            <div className="text-xs text-muted-foreground mb-4">
              Available briefings: {briefings.length}
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // Still loading briefings
  if (!currentBriefing) {
    return (
      <div className="flex h-screen">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto mb-4 skeleton rounded-full" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const personaColor = getPersonaColor(currentBriefing.persona)
  const personaEmoji = getPersonaEmoji(currentBriefing.persona)

  console.log('🎵 Rendering player with audio URL:', currentBriefing.audio_url)

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/5">
      {/* Sidebar */}
      <Sidebar currentPage="dashboard" />

      {/* Main Player Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {/* Player Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Player Card */}
            <Card className="p-8">
              <div className="space-y-6">
                {/* Header with persona */}
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
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium border inline-block mb-2"
                        style={{
                          borderColor: `${personaColor}50`,
                          backgroundColor: `${personaColor}15`,
                          color: personaColor,
                        }}
                      >
                        {currentBriefing.persona.toUpperCase()}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(currentBriefing.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Title */}
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

                {/* Debug Info */}
                <Card className="p-4 bg-muted">
                  <p className="text-xs font-mono mb-2">
                    <strong>Audio URL:</strong>
                  </p>
                  <p className="text-xs font-mono break-all">
                    {currentBriefing.audio_url}
                  </p>
                </Card>

                {/* Simple Audio Player */}
                <div className="space-y-4">
                  <audio
                    controls
                    src={currentBriefing.audio_url}
                    className="w-full"
                    style={{ height: '54px' }}
                    onError={(e) => {
                      console.error('❌ Audio error:', e)
                      console.error('❌ Audio URL that failed:', currentBriefing.audio_url)
                    }}
                    onLoadedData={() => {
                      console.log('✅ Audio loaded successfully')
                    }}
                  />
                  
                  {/* Navigation Buttons */}
                  <div className="flex gap-2 justify-center">
                    {briefings.findIndex(b => b.id === currentBriefing.id) > 0 && (
                      <Button onClick={handlePrevious} variant="outline">
                        <SkipBack className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                    )}
                    {briefings.findIndex(b => b.id === currentBriefing.id) < briefings.length - 1 && (
                      <Button onClick={handleNext} variant="outline">
                        Next
                        <SkipForward className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Transcript Toggle */}
                <div className="border-t pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="w-full"
                  >
                    {showTranscript ? 'Hide' : 'Show'} Transcript
                  </Button>
                </div>
              </div>
            </Card>

            {/* Transcript */}
            {showTranscript && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <Card className="p-8">
                  <h2 className="text-xl font-semibold mb-4">Transcript</h2>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {currentBriefing.script}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}