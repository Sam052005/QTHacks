'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Trophy, Lightbulb, CheckCircle2, XCircle, Loader2, Target, ChevronDown, ChevronUp, Activity, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSimulationStore } from '@/lib/simulation-store'
import { NavigationBar } from '@/components/simulator/navigation-bar'
import { ControlPanel } from '@/components/simulator/control-panel'
import { TimingDiagram } from '@/components/simulator/timing-diagram'

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const CircuitCanvas = dynamic(
  () => import('@/components/simulator/circuit-canvas').then(mod => ({ default: mod.CircuitCanvas })),
  { ssr: false, loading: () => <div className="flex h-full items-center justify-center text-muted-foreground text-sm"><Loader2 className="w-5 h-5 animate-spin mr-2" />Loading canvas...</div> }
)
const BlochSphere = dynamic(
  () => import('@/components/simulator/bloch-sphere').then(mod => ({ default: mod.BlochSphere })),
  { ssr: false }
)
const CircuitBuilder = dynamic(
  () => import('@/components/simulator/circuit-builder').then(mod => ({ default: mod.CircuitBuilder })),
  { ssr: false }
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
  const { 
    simulationId, setCircuitType, setNumFlipFlops, setInputBitSequence, 
    resetSimulation, circuitType, numFlipFlops, currentCycle,
    quantumMode 
  } = useSimulationStore()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [activeTab, setActiveTab] = useState<'simulation' | 'builder'>('simulation')
  const [hints, setHints] = useState<string[]>([])
  const [showHints, setShowHints] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [isDebugOpen, setIsDebugOpen] = useState(false)
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
        // Auto-load circuit config requirements for tracking, but DO NOT auto-build the circuit.
        // We let the user build it from scratch.
        try {
          const tc = JSON.parse(data.testCases)
          // Just reset simulation to empty state, do not set type or inputs.
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
      setIsInfoOpen(false) // Close info sheet automatically when submitting to show results
      setIsSheetOpen(true)
    } catch { 
      setEvalResult({ success: false, score: 0, message: 'Backend unreachable. Is it running?', details: {} }) 
      setIsInfoOpen(false)
      setIsSheetOpen(true)
    } finally { setIsSubmitting(false) }
  }

  if (!isMounted || !challenge) {
    return <div className="flex h-screen items-center justify-center bg-background text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-3" />Loading challenge...</div>
  }

  const testCriteria = (() => { try { return JSON.parse(challenge.testCases) } catch { return {} } })()

  return (
    <div className="flex h-screen flex-col bg-background overflow-hidden relative">
      <NavigationBar 
        onDebugClick={() => setIsDebugOpen(true)} 
        isChallengeMode={true} 
      />
      
      {/* Top Banner for Challenge mode instructions */}
      <div className="bg-primary/10 border-b border-primary/20 px-4 py-1.5 flex justify-between items-center shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
           <Trophy className="h-4 w-4 text-primary" />
           <span className="text-xs font-bold text-foreground">{challenge.title}</span>
        </div>
        <Button size="sm" variant="default" className="h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => setIsInfoOpen(true)}>
          <Target className="h-3.5 w-3.5 mr-1.5" />
          Challenge Details & Submit
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left — Control Panel */}
        <div className="w-[280px] shrink-0 border-r border-border overflow-y-auto hidden md:block z-10 bg-card shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]">
          <ControlPanel />
        </div>

        {/* Center — Workspace (Maximum Space) */}
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as any)} 
          className="flex-1 flex flex-col overflow-hidden bg-dot-pattern"
        >
          <div className="flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-4 py-2 shadow-sm z-10">
            <TabsList className="bg-secondary/50 border border-border/50">
              <TabsTrigger value="simulation" className="text-xs h-8 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Simulation</TabsTrigger>
              <TabsTrigger value="builder" className="text-xs h-8 px-4 data-[state=active]:bg-background data-[state=active]:shadow-sm">Circuit Builder</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 border border-border/50 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              <div className={`h-2 w-2 rounded-full ${quantumMode ? 'bg-purple-500 animate-pulse' : 'bg-primary'}`} />
              {quantumMode ? 'Quantum Engine Active' : 'Sequential Engine Active'}
            </div>
          </div>

          <TabsContent value="simulation" className="flex-1 flex flex-col m-0 overflow-hidden outline-none">
            <div className="flex-1 overflow-hidden relative bg-black/5">
              {quantumMode ? <BlochSphere /> : <CircuitCanvas />}
            </div>
            <div className="h-64 border-t border-border bg-card shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.5)] z-20">
              <TimingDiagram />
            </div>
          </TabsContent>

          <TabsContent value="builder" className="flex-1 m-0 overflow-hidden bg-background outline-none">
            <CircuitBuilder />
          </TabsContent>
        </Tabs>
      </div>

      {/* Challenge Information Sliding Panel (Right Side) */}
      <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
        <SheetContent side="right" className="w-[400px] sm:max-w-[400px] p-0 flex flex-col border-l border-primary/20 bg-card shadow-2xl">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border bg-muted/30">
            <Button variant="ghost" size="icon" onClick={() => setIsInfoOpen(false)} className="h-8 w-8 -ml-2 rounded-full hover:bg-secondary">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <SheetHeader>
              <SheetTitle className="font-bold text-lg leading-tight flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Challenge Info
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-xl text-foreground leading-tight">{challenge.title}</h2>
                <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${DifficultyColors[challenge.difficulty] ?? ''}`}>
                  {challenge.difficulty}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/20 p-3 rounded-lg border border-border/50">{challenge.description}</p>
            </div>

            <Separator className="bg-border/50" />

            {/* Objective */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
                <Target className="h-4 w-4 text-primary" />
                Mission Objective
              </h3>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 shadow-inner">
                <p className="text-sm text-foreground leading-relaxed font-medium">{challenge.objective}</p>
              </div>
            </div>

            {/* Circuit Requirements */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary/40 border border-border/60 rounded-lg p-3 text-center transition-colors hover:border-primary/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-bold">Target Circuit</p>
                <p className="text-xs font-mono font-black text-primary">{testCriteria.circuitType ?? '—'}</p>
              </div>
              <div className="bg-secondary/40 border border-border/60 rounded-lg p-3 text-center transition-colors hover:border-accent/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 font-bold">Flip-Flops</p>
                <p className="text-base font-mono font-black text-accent">{testCriteria.numFlipFlops ?? '—'}</p>
              </div>
            </div>

            {/* Live progress */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                Live Status
              </h3>
              <div className="space-y-2 bg-secondary/20 p-3 rounded-lg border border-border/50">
                {[
                  { label: 'Circuit Built & Detected', ok: circuitType === testCriteria.circuitType },
                  { label: `Component Count (${numFlipFlops}/${testCriteria.numFlipFlops ?? '?'})`, ok: numFlipFlops >= (testCriteria.numFlipFlops ?? 0) },
                  { label: 'Simulation verification active', ok: currentCycle >= 4 },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between p-1.5 rounded-md hover:bg-secondary/40 transition-colors">
                    <span className={`text-xs font-medium ${ok ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                    {ok ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 shadow-sm" /> : <div className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/30 border-dashed" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Hints */}
            {hints.length > 0 && (
              <div className="space-y-2 pt-2">
                <button onClick={() => setShowHints(v => !v)} className="flex items-center gap-2 text-xs font-bold text-accent hover:text-accent/80 transition-colors w-full justify-between bg-accent/10 border border-accent/20 px-3 py-2.5 rounded-lg">
                  <span className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    {showHints ? 'Hide Mission Intel' : `Request Mission Intel (${hints.length})`}
                  </span>
                  {showHints ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
                {showHints && (
                  <div className="bg-secondary/30 border border-border rounded-lg p-3 mt-2 shadow-inner">
                    <ul className="space-y-3">
                      {hints.map((h, i) => (
                        <li key={i} className="text-xs text-foreground leading-relaxed flex gap-2">
                          <span className="text-accent font-bold font-mono text-[10px] mt-0.5">{i+1}.</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button (Integrated into bottom of sheet) */}
          <div className="p-6 border-t border-border bg-card/95 backdrop-blur shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] shrink-0 z-10">
            <Button
              className="w-full gap-2 font-bold h-12 text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 text-primary-foreground animate-spin" />
                  Running Diagnostics...
                </>
              ) : (
                <>
                  <Trophy className="h-5 w-5 text-primary-foreground" />
                  Submit Mission for Grading
                </>
              )}
            </Button>
            {!simulationId && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-yellow-500/80 bg-yellow-500/10 py-1.5 px-3 rounded text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                <Activity className="h-3 w-3" />
                Run Engine First
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Debug Panel Sheet */}
      <Sheet open={isDebugOpen} onOpenChange={setIsDebugOpen}>
        <SheetContent side="bottom" className="h-[40vh] bg-black/95 text-green-400 border-t border-green-500/30 font-mono text-xs overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="text-green-500 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
              <Zap className="h-4 w-4" /> System Diagnostics Terminal
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pr-4">
             <div>
               <p className="opacity-50 uppercase mb-1 border-b border-green-500/20 pb-1">Current State</p>
               <pre className="mt-2 bg-black/50 p-3 rounded">
                 {JSON.stringify({ circuitType, numFlipFlops, cycle: currentCycle, engine: quantumMode ? 'Quantum' : 'Classical', runId: simulationId }, null, 2)}
               </pre>
             </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Result Sliding Panel (Evaluation Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md border-l border-primary/20 bg-background/95 backdrop-blur-md flex flex-col h-full shadow-2xl">
          <SheetHeader className="mb-6 flex-shrink-0">
            <SheetTitle className="flex items-center gap-2 text-2xl font-black">
              {evalResult?.success ? (
                <Trophy className="h-6 w-6 text-yellow-500 animate-bounce" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              )}
              Evaluation Complete
            </SheetTitle>
            <SheetDescription className="text-xs font-medium uppercase tracking-wider">
              Diagnostic verification logs
            </SheetDescription>
          </SheetHeader>

          {evalResult && (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6 pb-8">
              {/* Score Circular Plot (Visual Representation) */}
              <div className="flex flex-col items-center justify-center p-8 bg-black/5 rounded-2xl border border-border shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className={`text-7xl font-black mb-2 relative z-10 ${evalResult.success ? 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]'}`}>
                  {evalResult.score}%
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground relative z-10">
                  Total Match Accuracy
                </div>
              </div>

              {/* Message */}
              <div className={`p-4 rounded-xl border shadow-sm ${evalResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <p className={`text-sm leading-relaxed font-bold text-center ${evalResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {evalResult.message}
                </p>
              </div>

              {/* Criterion List */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-widest bg-secondary/30 p-2 rounded border border-border">
                  <Activity className="h-4 w-4 text-accent" />
                  Criteria Matrix
                </h4>
                <div className="grid gap-3">
                  {Object.entries(evalResult.details).map(([key, val]) => (
                    <div 
                      key={key} 
                      className={`flex flex-col gap-2 p-4 rounded-xl border transition-all ${val.passed ? 'bg-secondary/40 border-border hover:border-green-500/50' : 'bg-destructive/5 border-destructive/30 hover:border-destructive'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold capitalize text-foreground">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        {val.passed ? (
                          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-green-500 uppercase bg-green-500/10 px-2 py-1 rounded">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Passed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-wider text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded">
                            <XCircle className="h-3.5 w-3.5" />
                            Failed
                          </div>
                        )}
                      </div>
                      
                      {(val.expected !== undefined || val.actual !== undefined) && (
                        <div className="flex flex-col gap-1.5 mt-2 bg-background/50 rounded-lg p-3 border border-border/50">
                          {val.expected !== undefined && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target Spec</span>
                              <span className="text-xs font-mono font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded">{String(val.expected)}</span>
                            </div>
                          )}
                          {val.actual !== undefined && (
                            <>
                              <Separator className="bg-border/30 my-0.5" />
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Actual Output</span>
                                <span className={`text-xs font-mono font-black border px-1.5 py-0.5 rounded ${val.passed ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-red-500 border-red-500/20 bg-red-500/5'}`}>
                                  {String(val.actual)}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  className={`w-full font-bold h-12 text-sm shadow-md ${evalResult.success ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : ''}`} 
                  variant={evalResult.success ? "default" : "secondary"}
                  onClick={() => {
                    setIsSheetOpen(false)
                    if (evalResult.success) router.push('/') // Return to home on win
                  }}
                >
                  {evalResult.success ? 'Return to Workspace' : 'Recalibrate & Try Again'}
                </Button>
              </div>
            </div>
          </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
