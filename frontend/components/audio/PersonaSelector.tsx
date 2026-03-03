'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { getPersonaEmoji, getPersonaColor, cn } from '@/lib/utils'

interface PersonaSelectorProps {
  value: string
  onChange: (persona: string) => void
  className?: string
}

// Matches backend PERSONAS dict exactly (app/models/persona.py)
const PERSONAS = [
  { id: 'analyst',    name: 'Calm Analyst',         desc: 'Structured, neutral, data-first' },
  { id: 'journalist', name: 'TV Journalist',         desc: 'Vivid but factual storytelling'  },
  { id: 'streetwise', name: 'Streetwise Friend',     desc: 'Everyday language, relatable'    },
  { id: 'informant',  name: 'Insider Informant',     desc: 'Power dynamics, behind the scenes' },
  { id: 'colleague',  name: 'Colleague Over Coffee', desc: 'Smart, concise, slightly informal' },
]

export function PersonaSelector({ value, onChange, className }: PersonaSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium">Choose your narrator</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {PERSONAS.map((persona) => {
          const isSelected = value === persona.id
          const color = getPersonaColor(persona.id)
          const emoji = getPersonaEmoji(persona.id)

          return (
            <motion.button
              key={persona.id}
              onClick={() => onChange(persona.id)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all text-left",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                isSelected ? "border-primary" : "border-border hover:border-muted-foreground/50"
              )}
              style={{
                borderColor: isSelected ? color : undefined,
                backgroundColor: isSelected ? `${color}15` : undefined,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <span className="text-sm font-semibold">{persona.name}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">{persona.desc}</span>
              </div>

              {isSelected && (
                <>
                  {/* Animated border ring */}
                  <motion.div
                    layoutId="persona-indicator"
                    className="absolute inset-0 rounded-lg border-2"
                    style={{ borderColor: color }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                  {/* Check badge */}
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Check className="h-3 w-3 text-white" />
                  </div>
                </>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
