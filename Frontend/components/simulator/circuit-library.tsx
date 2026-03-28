'use client'

import { Library, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSimulationStore } from '@/lib/simulation-store'

interface CircuitPreset {
  name: string
  description: string
  circuitType: any
  numFlipFlops: number
  inputSequence: string
  cycles: number
}

const presets: CircuitPreset[] = [
  {
    name: '4-Bit Shift Register',
    description: 'Standard left-shift pattern for data transfer',
    circuitType: 'Shift Register',
    numFlipFlops: 4,
    inputSequence: '10110100',
    cycles: 16,
  },
  {
    name: '4-Bit Ring Counter',
    description: 'Single "1" rotating through states',
    circuitType: 'Ring Counter',
    numFlipFlops: 4,
    inputSequence: '00000000',
    cycles: 16,
  },
  {
    name: '4-Bit Johnson Counter',
    description: 'Ring counter with Q-bar feedback for 2N states',
    circuitType: 'Johnson Counter',
    numFlipFlops: 4,
    inputSequence: '00000000',
    cycles: 16,
  },
  {
    name: '8-Bit Shift Register',
    description: 'Extended data path for longer sequences',
    circuitType: 'Shift Register',
    numFlipFlops: 8,
    inputSequence: '11110000',
    cycles: 24,
  },
  {
    name: 'D Flip-Flop Cascade',
    description: 'Basic D flip-flop delay chain',
    circuitType: 'D Flip-Flop',
    numFlipFlops: 3,
    inputSequence: '101101',
    cycles: 12,
  },
  {
    name: 'T Flip-Flop Counter',
    description: 'Toggle flip-flops for frequency division',
    circuitType: 'T Flip-Flop',
    numFlipFlops: 3,
    inputSequence: '111111',
    cycles: 12,
  },
]

export function CircuitLibrary() {
  const [copiedPreset, setCopiedPreset] = useState<string | null>(null)
  const {
    setCircuitType,
    setNumFlipFlops,
    setInputBitSequence,
    setSimulationCycles,
    resetSimulation,
    setTabActive,
    startSimulation,
  } = useSimulationStore()

  const loadPreset = async (preset: CircuitPreset) => {
    // 1. Update circuit parameters
    setCircuitType(preset.circuitType)
    setNumFlipFlops(preset.numFlipFlops)
    setInputBitSequence(preset.inputSequence)
    setSimulationCycles(preset.cycles)
    
    // 2. Generate the 2D layout nodes and edges for the builder
    const { generateNodesForCircuit } = useSimulationStore.getState()
    generateNodesForCircuit(preset.circuitType, preset.numFlipFlops)
    
    // 3. Reset internal simulation state
    resetSimulation()
    
    // 4. Switch to Simulation view
    setTabActive('Simulation')
    
    // 5. Autostart the simulation for feedback
    startSimulation()
  }

  const copyPresetCode = (preset: CircuitPreset) => {
    const code = `// ${preset.name}
circuitType: '${preset.circuitType}'
numFlipFlops: ${preset.numFlipFlops}
inputSequence: '${preset.inputSequence}'
cycles: ${preset.cycles}`
    
    navigator.clipboard.writeText(code)
    setCopiedPreset(preset.name)
    setTimeout(() => setCopiedPreset(null), 2000)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-6 py-4">
        <Library className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Circuit Library</h2>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Click a preset to load its configuration instantly
        </p>

        {presets.map((preset, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-border bg-card p-4 space-y-3 hover:border-primary/50 transition-colors"
          >
            {/* Preset Name and Description */}
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">{preset.name}</h3>
              <p className="text-sm text-muted-foreground">{preset.description}</p>
            </div>

            {/* Preset Details */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/20 rounded p-2">
              <div>
                <span className="text-muted-foreground">Circuit: </span>
                <span className="font-mono text-primary">{preset.circuitType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Flip-Flops: </span>
                <span className="font-mono text-accent">{preset.numFlipFlops}</span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Input: </span>
                <span className="font-mono text-foreground">{preset.inputSequence}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => loadPreset(preset)}
                className="flex-1"
              >
                Load Preset
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyPresetCode(preset)}
              >
                {copiedPreset === preset.name ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
