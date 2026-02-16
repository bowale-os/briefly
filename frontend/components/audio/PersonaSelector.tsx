'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { getPersonaEmoji, getPersonaColor, cn } from '@/lib/utils'

interface PersonaSelectorProps {
  value: string
  onChange: (persona: string) => void
  className?: string
}

const personas = [
  { id: 'streetwise', label: 'Streetwise', description: 'Straight talk, real world' },
  { id: 'optimist', label: 'Optimist', description: 'Bright side, possibilities' },
  { id: 'skeptic', label: 'Skeptic', description: 'Critical eye, questions' },
]

export function PersonaSelector({ value, onChange, className }: PersonaSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium">Choose your narrator</label>
      <div className="grid grid-cols-3 gap-2">
        {personas.map((persona) => {
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
                isSelected
                  ? `border-[${color}] bg-opacity-10`
                  : "border-border hover:border-muted-foreground/50"
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
                <span className="text-sm font-medium">{persona.label}</span>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {persona.description}
                </span>
              </div>

              {isSelected && (
                <motion.div
                  layoutId="persona-indicator"
                  className="absolute inset-0 rounded-lg border-2"
                  style={{ borderColor: color }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}