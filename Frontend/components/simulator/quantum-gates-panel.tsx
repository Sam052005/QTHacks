'use client'

import { useState } from 'react'
import { useSimulationStore } from '@/lib/simulation-store'
import { Button } from '@/components/ui/button'
import { Atom, Zap, RotateCcw, Crosshair } from 'lucide-react'

const GATE_EXPLANATIONS: Record<string, string> = {
  H: 'Hadamard (H): Creates an equal superposition of |0⟩ and |1⟩. The qubit is neither 0 nor 1 — it is both simultaneously.',
  X: 'Pauli-X: The quantum NOT gate. Flips |0⟩→|1⟩ and |1⟩→|0⟩. Like a classical bit flip but also works on superpositions.',
  Measure: 'Measurement collapses the quantum state probabilistically. The qubit gives up its superposition and becomes definitively 0 or 1 based on |α|² and |β|².',
}

export function QuantumGatesPanel() {
  const { qubitAlpha, qubitBeta, applyHadamard, applyPauliX, measureQubit, resetQubit } = useSimulationStore()
  const [lastResult, setLastResult] = useState<number | null>(null)
  const [explanation, setExplanation] = useState<string>(GATE_EXPLANATIONS['H'])
  const [measuring, setMeasuring] = useState(false)

  const isSuper = Math.abs(qubitAlpha) < 0.99 && Math.abs(qubitBeta) < 0.99

  const handleMeasure = () => {
    setMeasuring(true)
    setExplanation(GATE_EXPLANATIONS['Measure'])
    setTimeout(() => {
      const result = measureQubit()
      setLastResult(result)
      setMeasuring(false)
    }, 600)
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Atom className="h-4 w-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-foreground">Quantum Gates</h3>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
          isSuper ? 'bg-purple-500/20 text-purple-400 animate-pulse' : 'bg-secondary text-muted-foreground'
        }`}>
          {isSuper ? '⟨ SUPERPOSITION ⟩' : qubitAlpha > 0.5 ? '|0⟩' : '|1⟩'}
        </span>
      </div>

      {/* Gate Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-14 flex flex-col gap-1 border-purple-500/40 hover:border-purple-500 hover:bg-purple-500/10"
          onClick={() => { applyHadamard(); setExplanation(GATE_EXPLANATIONS['H']) }}
        >
          <span className="text-lg font-bold text-purple-400">H</span>
          <span className="text-[10px] text-muted-foreground">Hadamard</span>
        </Button>

        <Button
          variant="outline"
          className="h-14 flex flex-col gap-1 border-blue-500/40 hover:border-blue-500 hover:bg-blue-500/10"
          onClick={() => { applyPauliX(); setExplanation(GATE_EXPLANATIONS['X']) }}
        >
          <span className="text-lg font-bold text-blue-400">X</span>
          <span className="text-[10px] text-muted-foreground">Pauli-X (NOT)</span>
        </Button>

        <Button
          variant="outline"
          className="h-14 flex flex-col gap-1 col-span-2 border-orange-500/40 hover:border-orange-500 hover:bg-orange-500/10"
          onClick={handleMeasure}
          disabled={measuring}
        >
          {measuring ? (
            <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          ) : (
            <Crosshair className="h-4 w-4 text-orange-400 mx-auto" />
          )}
          <span className="text-[10px] text-muted-foreground">{measuring ? 'Collapsing...' : 'Measure Qubit'}</span>
        </Button>
      </div>

      {/* Measurement Result */}
      {lastResult !== null && (
        <div className={`rounded-lg border p-3 text-center transition-all ${
          lastResult === 0
            ? 'border-blue-500/40 bg-blue-500/10'
            : 'border-green-500/40 bg-green-500/10'
        }`}>
          <p className="text-xs text-muted-foreground">Collapsed to</p>
          <p className={`text-3xl font-mono font-bold ${lastResult === 0 ? 'text-blue-400' : 'text-green-400'}`}>
            |{lastResult}⟩
          </p>
        </div>
      )}

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full gap-2 text-xs text-muted-foreground"
        onClick={() => { resetQubit(); setLastResult(null); setExplanation(GATE_EXPLANATIONS['H']) }}
      >
        <RotateCcw className="h-3 w-3" />
        Reset to |0⟩
      </Button>

      {/* Explanation */}
      <div className="flex-1 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
        <div className="flex items-center gap-1 mb-2">
          <Zap className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Quantum Insight</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
      </div>
    </div>
  )
}
