'use client'

import { useState } from 'react'
import { Atom, Zap, FlipHorizontal2, Crosshair } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantumLED } from '@/components/hardware/QuantumLED'
import { useSimulationStore } from '@/lib/simulation-store'
import { send } from '@/utils/hardwareInterface'

export function QuantumControls() {
  const {
    qubitAlpha,
    qubitBeta,
    isMeasured,
    measurementResult,
    applyHadamard,
    applyPauliX,
    performMeasurement,
    resetQubit,
  } = useSimulationStore()

  const [pending, setPending] = useState<string | null>(null)

  const dispatch = async (label: string, action: () => void, hwPayload: object) => {
    setPending(label)
    action()
    await send({ type: 'QUANTUM_UPDATE', ...hwPayload } as any)
    setPending(null)
  }

  const handleHadamard = () =>
    dispatch('H', applyHadamard, { alpha: qubitAlpha, beta: qubitBeta })

  const handleNot = () =>
    dispatch('X', applyPauliX, { alpha: qubitAlpha, beta: qubitBeta })

  const handleMeasure = async () => {
    setPending('M')
    performMeasurement()
    await send({ type: 'MEASURE', alpha: qubitAlpha, beta: qubitBeta })
    setPending(null)
  }

  const handleReset = () => {
    resetQubit()
    send({ type: 'QUANTUM_UPDATE', alpha: 1, beta: 0 })
  }

  const isPending = (label: string) => pending === label

  return (
    <div className="space-y-3 rounded-md border border-border bg-secondary/30 p-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Atom className="h-4 w-4 text-primary" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quantum Controls
        </h4>
      </div>

      {/* Quantum LED — live qubit visualization */}
      <div className="flex justify-center py-2">
        <QuantumLED
          alpha={qubitAlpha}
          beta={qubitBeta}
          measured={isMeasured}
          size={56}
        />
      </div>

      {/* α / β readout */}
      <div className="grid grid-cols-2 gap-2 font-mono text-[10px] text-muted-foreground">
        <div className="rounded bg-background/50 px-2 py-1">
          α = {qubitAlpha.toFixed(3)}
        </div>
        <div className="rounded bg-background/50 px-2 py-1">
          β = {qubitBeta.toFixed(3)}
        </div>
      </div>

      {/* Gate Buttons */}
      <div className="grid grid-cols-3 gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={isMeasured || !!pending}
          onClick={handleHadamard}
          className="h-9 flex-col gap-0.5 text-[10px] border-primary/40 hover:bg-primary/10 hover:border-primary"
        >
          {isPending('H') ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <FlipHorizontal2 className="h-3.5 w-3.5 text-primary" />
          )}
          <span>Hadamard</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isMeasured || !!pending}
          onClick={handleNot}
          className="h-9 flex-col gap-0.5 text-[10px] border-accent/40 hover:bg-accent/10 hover:border-accent"
        >
          {isPending('X') ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          ) : (
            <Zap className="h-3.5 w-3.5 text-accent" />
          )}
          <span>Pauli-X</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          disabled={isMeasured || !!pending}
          onClick={handleMeasure}
          className="h-9 flex-col gap-0.5 text-[10px] border-yellow-500/40 hover:bg-yellow-500/10 hover:border-yellow-400"
        >
          {isPending('M') ? (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
          ) : (
            <Crosshair className="h-3.5 w-3.5 text-yellow-400" />
          )}
          <span>Measure</span>
        </Button>
      </div>

      {/* Measurement result */}
      {isMeasured && measurementResult !== null && (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-center">
          <p className="text-[10px] text-yellow-400">
            Collapsed → <span className="font-mono font-bold text-sm">{measurementResult === 0 ? '|0⟩' : '|1⟩'}</span>
          </p>
          <button
            onClick={handleReset}
            className="text-[9px] text-muted-foreground underline underline-offset-2 mt-1 hover:text-foreground"
          >
            Reset qubit
          </button>
        </div>
      )}

      <p className="text-[9px] text-muted-foreground italic leading-relaxed">
        150ms hardware delay applied to all gate operations.
      </p>
    </div>
  )
}
