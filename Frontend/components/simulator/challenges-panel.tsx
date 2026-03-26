'use client'

import { Trophy, CheckCircle2, Circle, ArrowRight, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'

interface Challenge {
  id: string; title: string; description: string;
  objective: string; hints: string; testCases: string; difficulty: string;
}

interface CompletedChallenge { id: string; completedAt: number }

const DifficultyOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 }
const DifficultyColors: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export function ChallengesPanel() {
  const router = useRouter()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [completed, setCompleted] = useState<CompletedChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/challenges')
      .then(r => r.json())
      .then((data: Challenge[]) => {
        const sorted = data.sort((a, b) =>
          (DifficultyOrder[a.difficulty] ?? 99) - (DifficultyOrder[b.difficulty] ?? 99)
        )
        setChallenges(sorted)
      })
      .catch(() => setChallenges([]))
      .finally(() => setLoading(false))
    // Load completions from local storage
    try {
      const saved = localStorage.getItem('completedChallenges')
      if (saved) setCompleted(JSON.parse(saved))
    } catch {}
  }, [])

  const isCompleted = (id: string) => completed.some(c => c.id === id)
  const completedCount = completed.filter(c => challenges.some(ch => ch.id === c.id)).length

  const getTestCriteria = (ch: Challenge) => {
    try { return JSON.parse(ch.testCases) } catch { return {} }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        Loading challenges...
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Learning Challenges</h2>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {challenges.length} completed
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: challenges.length > 0 ? `${(completedCount / challenges.length) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {challenges.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            <p>No challenges found.</p>
            <p className="text-xs mt-1">Make sure the backend is running and seeds are applied.</p>
          </div>
        )}

        {challenges.map((challenge) => {
          const done = isCompleted(challenge.id)
          const tc = getTestCriteria(challenge)
          return (
            <div
              key={challenge.id}
              className={`rounded-lg border transition-all ${
                done ? 'border-primary/30 bg-primary/5' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    {done
                      ? <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      : <Circle className="h-5 w-5 text-muted-foreground/40 shrink-0" />
                    }
                    <h3 className="font-semibold text-foreground text-sm leading-tight">{challenge.title}</h3>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border shrink-0 ${DifficultyColors[challenge.difficulty] ?? ''}`}>
                    {challenge.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">{challenge.description}</p>

                {/* Objective snippet */}
                <div className="bg-secondary/20 rounded px-2.5 py-2 space-y-0.5">
                  <p className="text-[10px] font-semibold text-foreground uppercase tracking-wide">Objective</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{challenge.objective}</p>
                </div>

                {/* Metadata tags */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {tc.circuitType && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">{tc.circuitType}</span>
                  )}
                  {tc.numFlipFlops && (
                    <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full">{tc.numFlipFlops} flip-flops</span>
                  )}
                </div>

                <Separator />

                {/* CTA */}
                <Button
                  size="sm"
                  variant={done ? 'outline' : 'default'}
                  onClick={() => window.open(`/challenges/${challenge.id}`, '_blank')}
                  className="w-full gap-2"
                >
                  {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                  {done ? 'Review Challenge' : 'Start Challenge'}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card/50 px-6 py-3 text-center text-xs text-muted-foreground">
        {completedCount === challenges.length && challenges.length > 0 && (
          <p className="text-primary font-semibold">🎉 All challenges completed! You are a sequential logic master.</p>
        )}
        {completedCount > 0 && completedCount < challenges.length && (
          <p>Keep going! {challenges.length - completedCount} challenges left.</p>
        )}
        {completedCount === 0 && <p>Ready to start learning? Pick your first challenge above.</p>}
      </div>
    </div>
  )
}
