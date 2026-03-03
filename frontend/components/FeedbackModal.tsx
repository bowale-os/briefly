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

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Okay',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
}

const NPS_SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [nps, setNps] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    setIsSubmitting(true)
    try {
      await feedbackAPI.submit({
        rating: rating ?? undefined,
        likely_to_recommend: nps !== null ? String(nps) : undefined,
        message: message.trim(),
      })
      setSubmitted(true)
    } catch {
      // Silently fail — feedback loss is not critical
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setRating(null)
      setNps(null)
      setMessage('')
      setSubmitted(false)
    }, 300)
  }

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
            className="fixed z-50 bottom-6 left-6 w-[360px] bg-card border border-border rounded-2xl shadow-2xl"
          >
            {submitted ? (
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

                <div className="p-5 space-y-5">
                  {/* Overall rating 1–5 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Overall experience
                      </p>
                      {rating !== null && (
                        <span className="text-xs text-muted-foreground">
                          {RATING_LABELS[rating]}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className={`flex-1 h-9 rounded-lg text-sm font-medium border transition-colors ${
                            rating === n
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NPS — likely to recommend 0–10 */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                      How likely are you to recommend Briefly?
                    </p>
                    <div className="flex gap-1">
                      {NPS_SCORES.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setNps(n)}
                          className={`flex-1 h-8 rounded text-xs font-medium border transition-colors ${
                            nps === n
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/50 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-muted-foreground">Not at all</span>
                      <span className="text-[10px] text-muted-foreground">Extremely likely</span>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
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
