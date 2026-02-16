'use client'

import React from 'react'
import { Play, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefing } from '@/lib/api'
import { getPersonaEmoji, getPersonaColor, formatDate, truncate, cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface BriefingCardProps {
  briefing: Briefing
  index?: number
}

export function BriefingCard({ briefing, index = 0 }: BriefingCardProps) {
  const router = useRouter()
  const personaColor = getPersonaColor(briefing.persona)
  const personaEmoji = getPersonaEmoji(briefing.persona)

  const handlePlay = () => {
    router.push(`/player/${briefing.id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-0">
          <div className="p-6">
            {/* Header with persona badge */}
            <div className="flex items-start justify-between mb-3">
              <div
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5",
                  `persona-${briefing.persona}`
                )}
              >
                <span>{personaEmoji}</span>
                <span className="capitalize">{briefing.persona}</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(briefing.created_at)}
              </div>
            </div>

            {/* Query */}
            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {truncate(briefing.query, 80)}
            </h3>

            {/* Script preview */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {truncate(briefing.script, 120)}
            </p>

            {/* Play button */}
            <Button
              onClick={handlePlay}
              className="w-full group-hover:scale-105 transition-transform"
              style={{
                backgroundColor: personaColor,
                borderColor: personaColor,
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Listen Now
            </Button>
          </div>

          {/* Visual accent bar */}
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, ${personaColor} 0%, transparent 100%)`,
            }}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}