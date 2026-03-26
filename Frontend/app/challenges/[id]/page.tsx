'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Trophy, Lightbulb, CheckCircle2, XCircle, Loader2, Target, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSimulationStore } from '@/lib/simulation-store'
import { NavigationBar } from '@/components/simulator/navigation-bar'
import { ControlPanel } from '@/components/simulator/control-panel'
import { TimingDiagram } from '@/components/simulator/timing-diagram'

const CircuitCanvas = dynamic(
  () => import('@/components/simulator/circuit-canvas').then(mod => ({ default: mod.CircuitCanvas })),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted-foreground text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" />Loading canvas...</div> }
)

interface Challenge {
  id: string; title: string; description: string; difficulty: string;
  objective: string; hints: string; testCases: string;
}

interface EvalResult {
  success: boolean; score: number; message: string;
  details: Record<string, { expected: any; actual?: any; found?: boolean; passed: boolean }>;
}

const DifficultyColors: Record<string, string> = {
  easy: 'bg-green-500/15 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  hard: 'bg-red-500/15 text-red-400 border-red-500/30',
}

export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  
  const router = useRouter()
  const { simulationId, setCircuitType, setNumFlipFlops, setInputBitSequence, resetSimulation, circuitType, numFlipFlops, currentCycle } = useSimulationStore()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [hints, setHints] = useState<string[]>([])
  const [showHints, setShowHints] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  // Load challenge definition from backend
  useEffect(() => {
    if (!id) return
    fetch(`http://localhost:3001/api/challenges/${id}`)
      .then(async r => {
        if (!r.ok) throw new Error(`Challenge "${id}" not found`)
        return r.json()
      })
      .then((data: Challenge) => {
        setChallenge(data)
        // Auto-load circuit config from testCases
        try {
          const tc = JSON.parse(data.testCases)
          if (tc.circuitType) setCircuitType(tc.circuitType)
          if (tc.numFlipFlops) setNumFlipFlops(tc.numFlipFlops)
          if (tc.expectedPattern) setInputBitSequence(tc.expectedPattern)
          resetSimulation()
        } catch {}
        // Load hints
        fetch(`http://localhost:3001/api/challenges/${id}/hint`)
          .then(r => r.json())
          .then(h => setHints(h.hints || []))
      })
      .catch(err => {
        console.error(err)
        setError(err.message)
      })
  }, [id])

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-background text-center p-6 space-y-4">
        <XCircle className="h-12 w-12 text-destructive" />
        <h1 className="text-xl font-bold">Challenge Not Found</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.close()}>Close Tab</Button>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!simulationId) { alert('Please run the simulation for at least 4 clock cycles first!'); return }
    setIsSubmitting(true)
    setEvalResult(null)
    try {
      const res = await fetch(`http://localhost:3001/api/challenges/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simulationId })
      })
      const data = await res.json()
      setEvalResult(data)
    } catch { setEvalResult({ success: false, score: 0, message: 'Backend unreachable. Is it running?', details: {} }) }
    finally { setIsSubmitting(false) }
  }

  if (!isMounted || !challenge) {
    return <div className="flex h-screen items-center justify-center bg-background text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-3" />Loading challenge...</div>
  }

  const testCriteria = (() => { try { return JSON.parse(challenge.testCases) } catch { return {} } })()

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden">
      <NavigationBar onDebugClick={() => {}} isChallengeMode={true} />

      <div className="flex flex-1 overflow-hidden">
        {/* Left — Control Panel */}
        <div className="w-[280px] shrink-0 border-r border-border overflow-y-auto">
          <ControlPanel />
        </div>

        {/* Center — Circuit Canvas + Timing Diagram */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CircuitCanvas />
          </div>
          <div className="h-48 border-t border-border bg-card">
            <TimingDiagram />
          </div>
        </div>

        {/* Right — Challenge Info & Evaluation Panel */}
        <div className="w-96 shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
          {/* Back button */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="h-7 w-7 p-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">Back to Library</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <h2 className="font-bold text-foreground text-base leading-tight">{challenge.title}</h2>
              </div>
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded border ${DifficultyColors[challenge.difficulty] ?? ''}`}>
                {challenge.difficulty.toUpperCase()}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{challenge.description}</p>
            </div>

            <Separator />

            {/* Objective */}
            <div className="space-y-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Target className="h-4 w-4 text-primary" />
                Objective
              </h3>
              <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
                <p className="text-sm text-foreground leading-relaxed">{challenge.objective}</p>
              </div>
            </div>

            {/* Circuit Requirements */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-secondary/30 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Circuit Type</p>
                <p className="text-xs font-mono font-bold text-primary">{testCriteria.circuitType ?? '—'}</p>
              </div>
              <div className="bg-secondary/30 rounded-md p-2.5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Flip-Flops</p>
                <p className="text-xs font-mono font-bold text-accent">{testCriteria.numFlipFlops ?? '—'}</p>
              </div>
            </div>

            {/* Live progress */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Your Progress</h3>
              <div className="space-y-1.5">
                {[
                  { label: 'Circuit Type', ok: circuitType === testCriteria.circuitType },
                  { label: `≥ ${testCriteria.numFlipFlops ?? '?'} Flip-Flops`, ok: numFlipFlops >= (testCriteria.numFlipFlops ?? 0) },
                  { label: 'Ran ≥ 4 Cycles', ok: currentCycle >= 4 },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center gap-2">
                    {ok ? <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" /> : <XCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />}
                    <span className={`text-xs ${ok ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints */}
            {hints.length > 0 && (
              <div className="space-y-2">
                <button onClick={() => setShowHints(v => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent/80 transition-colors">
                  <Lightbulb className="h-4 w-4" />
                  {showHints ? 'Hide Hints' : `Show Hints (${hints.length})`}
                  {showHints ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {showHints && (
                  <ul className="space-y-1.5 pl-2 border-l-2 border-accent/30">
                    {hints.map((h, i) => (
                      <li key={i} className="text-xs text-muted-foreground leading-relaxed">{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <Separator />

            {/* Evaluation Result */}
            {evalResult && (
              <div className={`rounded-md border p-3 space-y-3 ${evalResult.success ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${evalResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {evalResult.success ? '🎉 Passed!' : '❌ Not yet'}
                  </span>
                  <span className={`text-lg font-black ${evalResult.success ? 'text-green-400' : 'text-red-400'}`}>{evalResult.score}%</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{evalResult.message}</p>
                {/* Detailed breakdown */}
                <div className="space-y-1.5">
                  {Object.entries(evalResult.details).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      {val.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />}
                      <span className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      {val.expected !== undefined && (
                        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                          Expected: <span className="text-foreground">{String(val.expected)}</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="p-4 border-t border-border bg-card/80">
            <Button
              className="w-full gap-2 font-semibold"
              size="lg"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trophy className="h-4 w-4" />}
              {isSubmitting ? 'Evaluating...' : 'Submit for Grading'}
            </Button>
            {!simulationId && (
              <p className="text-[10px] text-muted-foreground text-center mt-2">Run the simulation first to submit</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
