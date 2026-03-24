'use client'

import { Trophy, Zap, CheckCircle2, Circle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSimulationStore } from '@/lib/simulation-store'

interface Challenge {
  id: string
  title: string
  description: string
  objective: string
  hint: string
  circuitType: any
  expectedPattern: string
  numFlipFlops: number
  difficulty: 'easy' | 'medium' | 'hard'
}

const challenges: Challenge[] = [
  {
    id: 'shift-basic',
    title: 'Understand Shift Registers',
    description: 'Load a known pattern and observe how it shifts',
    objective: 'Input pattern "1001" and verify it shifts left one position per clock cycle',
    hint: 'The first flip-flop captures the input, each other takes the Q from previous',
    circuitType: 'Shift Register',
    expectedPattern: '1001',
    numFlipFlops: 4,
    difficulty: 'easy',
  },
  {
    id: 'ring-detect',
    title: 'Recognize Ring Counter',
    description: 'Identify a ring counter pattern by its rotating "1"',
    objective: 'Set up a 4-bit ring counter and observe 4 unique states repeating',
    hint: 'Last flip-flop Q feeds back to first flip-flop input',
    circuitType: 'Ring Counter',
    expectedPattern: '1000',
    numFlipFlops: 4,
    difficulty: 'easy',
  },
  {
    id: 'johnson-states',
    title: 'Count Johnson States',
    description: 'Johnson counter has double the states of ring counter',
    objective: 'Verify 8-bit Johnson counter creates 8 unique states (2N for N flip-flops)',
    hint: 'Uses Q-bar feedback instead of Q feedback',
    circuitType: 'Johnson Counter',
    expectedPattern: '',
    numFlipFlops: 4,
    difficulty: 'medium',
  },
  {
    id: 'delay-chain',
    description: 'Create a data delay chain with D flip-flops',
    objective: 'Input "101" and verify output appears N cycles later in an N-stage chain',
    hint: 'Each flip-flop adds one clock cycle of delay',
    title: 'Propagation Delay',
    circuitType: 'D Flip-Flop',
    expectedPattern: '101',
    numFlipFlops: 3,
    difficulty: 'medium',
  },
  {
    id: 'frequency-div',
    title: 'Frequency Divider',
    description: 'Use T flip-flops to divide clock frequency',
    objective: 'Create a /8 frequency divider (3 toggle flip-flops)',
    hint: 'Each T flip-flop divides frequency by 2 when toggling',
    circuitType: 'T Flip-Flop',
    expectedPattern: '',
    numFlipFlops: 3,
    difficulty: 'medium',
  },
  {
    id: 'sequence-detect',
    title: 'Sequence Detection',
    description: 'Design a shift register to detect "1011" pattern',
    objective: 'Configure shift register to recognize "1011" appearing in sequence',
    hint: 'Shift register stores last 4 inputs, compare against target pattern',
    circuitType: 'Shift Register',
    expectedPattern: '1011',
    numFlipFlops: 4,
    difficulty: 'hard',
  },
]

interface CompletedChallenge {
  id: string
  completedAt: number
}

export function ChallengesPanel() {
  const [completed, setCompleted] = useState<CompletedChallenge[]>([])
  const {
    setCircuitType,
    setNumFlipFlops,
    setInputBitSequence,
    resetSimulation,
    simulationId,
  } = useSimulationStore()
  
  const [verifying, setVerifying] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  const loadChallenge = (challenge: Challenge) => {
    setCircuitType(challenge.circuitType)
    setNumFlipFlops(challenge.numFlipFlops)
    if (challenge.expectedPattern) {
      setInputBitSequence(challenge.expectedPattern)
    }
    resetSimulation()
  }

  const verifyChallenge = async (id: string) => {
    if (!simulationId) {
      setMessage({ text: 'Please start a simulation first!', type: 'error' })
      return
    }

    setVerifying(id)
    setMessage(null)

    try {
      const response = await fetch(`http://localhost:3001/api/challenges/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (!completed.find(c => c.id === id)) {
          setCompleted([...completed, { id, completedAt: Date.now() }])
        }
        setMessage({ text: data.message, type: 'success' })
      } else {
        setMessage({ text: data.message, type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Failed to verify. Is the backend running?', type: 'error' })
    } finally {
      setVerifying(null)
    }
  }

  const completeChallenge = (id: string) => {
    if (!completed.find(c => c.id === id)) {
      setCompleted([...completed, { id, completedAt: Date.now() }])
    }
  }

  const isCompleted = (id: string) => completed.some(c => c.id === id)

  const completedCount = completed.length
  const totalCount = challenges.length

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'hard': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-gray-500/10 text-gray-500'
    }
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
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {challenges.map((challenge) => {
          const completed = isCompleted(challenge.id)
          return (
            <div
              key={challenge.id}
              className={`rounded-lg border transition-all ${
                completed
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {completed ? (
                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <h3 className="font-semibold text-foreground">{challenge.title}</h3>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded border ${getDifficultyColor(challenge.difficulty)}`}
                  >
                    {challenge.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground">{challenge.description}</p>

                {/* Objective */}
                <div className="bg-secondary/20 rounded p-2 space-y-1">
                  <p className="text-xs font-semibold text-foreground">Objective:</p>
                  <p className="text-xs text-muted-foreground">{challenge.objective}</p>
                </div>

                {/* Hint */}
                <div className="bg-accent/5 rounded p-2 border border-accent/20 space-y-1">
                  <p className="text-xs font-semibold text-accent">💡 Hint:</p>
                  <p className="text-xs text-muted-foreground">{challenge.hint}</p>
                </div>

                {/* Configuration */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/10 rounded p-2">
                  <div>
                    <span className="text-muted-foreground">Circuit: </span>
                    <span className="font-mono text-primary">{challenge.circuitType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Flip-Flops: </span>
                    <span className="font-mono text-accent">{challenge.numFlipFlops}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={completed ? 'outline' : 'default'}
                    onClick={() => loadChallenge(challenge)}
                    className="flex-1"
                  >
                    {completed ? 'Review' : 'Start Challenge'}
                  </Button>
                  {!completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyChallenge(challenge.id)}
                      disabled={verifying === challenge.id}
                      className="gap-2"
                    >
                      {verifying === challenge.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Verify
                    </Button>
                  )}
                </div>

                {message && verifying === null && !completed && (
                  <p className={`text-[10px] font-medium ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-border bg-card/50 px-6 py-3">
        <div className="text-center text-xs text-muted-foreground">
          {completedCount === totalCount && (
            <p className="text-primary font-semibold">🎉 All challenges completed!</p>
          )}
          {completedCount > 0 && completedCount < totalCount && (
            <p>Keep going! {totalCount - completedCount} challenges remaining.</p>
          )}
          {completedCount === 0 && <p>Ready to start learning? Pick your first challenge!</p>}
        </div>
      </div>
    </div>
  )
}
