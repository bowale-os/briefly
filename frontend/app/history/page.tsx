'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sidebar } from '@/components/Sidebar'
import { BriefingCard } from '@/components/audio/BriefingCard'
import { useAuthStore, useBriefingStore } from '@/store/useBriefingStore'
import { briefingsAPI } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { getPersonaEmoji } from '@/lib/utils'

const personas = [
  { id: 'streetwise', name: 'Streetwise' },
  { id: 'optimist', name: 'Optimist' },
  { id: 'skeptic', name: 'Skeptic' },
]

export default function HistoryPage() {
  const router = useRouter()
  const { user, initAuth } = useAuthStore()
  const { briefings, setBriefings } = useBriefingStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  const { isLoading } = useQuery({
    queryKey: ['briefings', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const data = await briefingsAPI.getBriefings(user.id)
      console.log(data);
      setBriefings(data)
      return data
    },
    enabled: !!user?.id,
  })

  // Filter briefings
  const filteredBriefings = briefings.filter((briefing) => {
    const matchesSearch =
      searchQuery === '' ||
      briefing.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      briefing.script.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesPersona = !selectedPersona || briefing.persona === selectedPersona

    return matchesSearch && matchesPersona
  })

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedPersona(null)
  }

  const hasActiveFilters = searchQuery !== '' || selectedPersona !== null

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/5">
      {/* Sidebar */}
      <Sidebar currentPage="history" />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">All Briefings</h1>
            <p className="text-lg text-muted-foreground">
              {filteredBriefings.length} briefing{filteredBriefings.length !== 1 ? 's' : ''} found
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search briefings by topic or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-12 text-base bg-card"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Persona Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filter:</span>
              </div>
              <Button
                variant={selectedPersona === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPersona(null)}
                className="rounded-full"
              >
                All
              </Button>
              {personas.map((persona) => (
                <Button
                  key={persona.id}
                  variant={selectedPersona === persona.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPersona(persona.id)}
                  className="rounded-full"
                >
                  <span className="mr-1.5">{getPersonaEmoji(persona.id)}</span>
                  {persona.name}
                </Button>
              ))}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
          </motion.div>

          {/* Briefings Grid */}
          {isLoading ? (
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl skeleton" />
              ))}
            </div>
          ) : filteredBriefings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="max-w-sm mx-auto">
                <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No briefings found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your search or filters'
                    : 'Create your first briefing to get started'}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline">
                    Clear filters
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredBriefings.map((briefing, index) => (
                <BriefingCard key={briefing.id} briefing={briefing} index={index} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}