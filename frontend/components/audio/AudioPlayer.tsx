'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '@/store/useBriefingStore'
import { formatDuration, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Briefing } from '@/lib/api'

interface AudioPlayerProps {
  briefing: Briefing
  onNext?: () => void
  onPrevious?: () => void
}

export function AudioPlayer({ briefing, onNext, onPrevious }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  const {
    isPlaying,
    progress,
    duration,
    playbackRate,
    volume,
    setIsPlaying,
    setProgress,
    setDuration,
    setPlaybackRate,
    setVolume,
  } = usePlayerStore()

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsReady(true)
    }

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (onNext) onNext()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [setDuration, setProgress, setIsPlaying, onNext])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play()
    } else {
      audio.pause()
    }
  }, [isPlaying])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = playbackRate
  }, [playbackRate])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const bar = progressBarRef.current
    if (!audio || !bar) return

    const rect = bar.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    audio.currentTime = newTime
    setProgress(newTime)
  }

  const cyclePlaybackRate = () => {
    const rates = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0]
    const currentIndex = rates.indexOf(playbackRate)
    const nextIndex = (currentIndex + 1) % rates.length
    setPlaybackRate(rates[nextIndex])
  }

  const toggleMute = () => {
    setVolume(volume === 0 ? 1.0 : 0)
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="w-full">
      <audio ref={audioRef} src={briefing.audio_url} preload="auto" />

      {/* Waveform visualization */}
      <div className="relative h-24 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-muted/50 to-muted/20">
        <motion.div
          className="absolute inset-0 audio-visualizer"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isPlaying ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ transformOrigin: 'left' }}
        />
        
        {/* Progress indicator */}
        <div 
          ref={progressBarRef}
          className="relative h-full cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div className="absolute inset-0 flex items-center px-2">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "flex-1 mx-0.5 rounded-full transition-all",
                  i / 50 <= progressPercent / 100
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                }}
                animate={{
                  height: isPlaying ? [`${Math.random() * 60 + 20}%`, `${Math.random() * 60 + 20}%`] : undefined
                }}
                transition={{
                  duration: 0.5,
                  repeat: isPlaying ? Infinity : 0,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Time display */}
      <div className="flex justify-between text-sm text-muted-foreground mb-4 font-mono">
        <span>{formatDuration(progress)}</span>
        <span>{formatDuration(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onPrevious}
              className="h-9 w-9"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
          )}

          <Button
            size="icon"
            onClick={togglePlayPause}
            disabled={!isReady}
            className="h-12 w-12 rounded-full shadow-lg"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNext}
              className="h-9 w-9"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={cyclePlaybackRate}
            className="font-mono min-w-[60px]"
          >
            {playbackRate}x
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-9 w-9"
          >
            {volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}