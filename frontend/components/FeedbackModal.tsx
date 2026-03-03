'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { feedbackAPI } from '@/lib/api'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const RATINGS = [
  { value: 1, emoji: '😞', label: 'Poor' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😄', label: 'Great' },
  { value: 5, emoji: '🤩', label: 'Loved it' },
]

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setIsSubmitting(true)
    try {
      await feedbackAPI.submit({ rating: rating ?? undefined, message: message.trim() })
      setSubmitted(true)
    } catch {
      // Silently fail — feedback loss is not critical
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset after the animation plays out
    setTimeout(() => {
      setRating(null)
      setMessage('')
      setSubmitted(false)
    }, 300)
  }

  const activeRating = hoveredRating ?? rating

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bottom-6 left-6 w-[340px] bg-card border border-border rounded-2xl shadow-2xl"
          >
            {submitted ? (
              /* Thank-you state */
              <div className="p-6 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
                <h3 className="font-semibold text-lg">Thanks for the feedback!</h3>
                <p className="text-sm text-muted-foreground">
                  Every response helps us make Briefly better.
                </p>
                <Button className="w-full mt-2" onClick={handleClose}>
                  Close
                </Button>
              </div>
            ) : (
              /* Feedback form */
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Share your thoughts</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Emoji Rating */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                      How was your experience?
                    </p>
                    <div className="flex justify-between">
                      {RATINGS.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRating(r.value)}
                          onMouseEnter={() => setHoveredRating(r.value)}
                          onMouseLeave={() => setHoveredRating(null)}
                          className="flex flex-col items-center gap-1 group"
                        >
                          <span
                            className={`text-2xl transition-transform duration-100 ${
                              activeRating === r.value ? 'scale-125' : 'scale-100 opacity-50 group-hover:opacity-100'
                            }`}
                          >
                            {r.emoji}
                          </span>
                          <span
                            className={`text-[10px] transition-opacity ${
                              activeRating === r.value
                                ? 'opacity-100 text-foreground font-medium'
                                : 'opacity-0 group-hover:opacity-60'
                            }`}
                          >
                            {r.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
                      Anything else on your mind?
                    </p>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What worked, what didn't, what you'd love to see..."
                      rows={3}
                      className="w-full px-3 py-2.5 bg-muted/50 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!message.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send feedback'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
