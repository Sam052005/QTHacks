'use client'

import { useSimulationStore } from '@/lib/simulation-store'
import { CIRCUIT_MAPPINGS } from '@/data/mappings'
import { Cpu, Globe, Zap, Info } from 'lucide-react'

export function RealWorldPanel() {
  const { detectedCircuit, circuitType } = useSimulationStore()

  // Try detected circuit first, then strip bit prefix, then use circuitType
  const key = detectedCircuit?.replace(/^\d+-bit /, '') || circuitType
  const mapping = CIRCUIT_MAPPINGS[key] || CIRCUIT_MAPPINGS[circuitType]

  if (!mapping) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
        <Globe className="h-6 w-6" />
        <p className="text-xs">Run a simulation to see real-world mapping.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Globe className="h-4 w-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-foreground">Real-World Mapping</h3>
      </div>

      {/* IC Chip Badge */}
      <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3">
        <Cpu className="h-8 w-8 text-cyan-400 shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">Physical IC</p>
          <p className="text-lg font-mono font-bold text-cyan-400">{mapping.ic}</p>
          <p className="text-[10px] text-muted-foreground">≤ {mapping.frequency}</p>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex items-center gap-1 mb-1">
          <Info className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">How it works</span>
        </div>
        <p className="text-xs text-foreground">{mapping.description}</p>
      </div>

      {/* Applications */}
      <div className="rounded-lg border border-border bg-secondary/30 p-3">
        <div className="flex items-center gap-1 mb-2">
          <Zap className="h-3 w-3 text-yellow-400" />
          <span className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider">Used In</span>
        </div>
        <p className="text-xs text-foreground">{mapping.application}</p>
      </div>

      {/* Fun Fact */}
      <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">💡 Fun Fact</p>
        <p className="text-xs text-muted-foreground italic">{mapping.fun_fact}</p>
      </div>
    </div>
  )
}
