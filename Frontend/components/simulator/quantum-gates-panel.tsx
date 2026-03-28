'use client'

import { useState } from 'react'
import { useSimulationStore } from '@/lib/simulation-store'
import { Button } from '@/components/ui/button'
import { Atom, Zap, RotateCcw, Crosshair, Waves, Link2 } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'

const GATE_EXPLANATIONS: Record<string, string> = {
  H: 'Hadamard (H): Creates an equal superposition of |0⟩ and |1⟩. The qubit is neither 0 nor 1 — it is both simultaneously.',
  X: 'Pauli-X: The quantum NOT gate. Flips |0⟩→|1⟩ and |1⟩→|0⟩. Like a classical bit flip but also works on superpositions.',
  Z: 'Pauli-Z: Phase flip gate. Flips the phase of |1⟩ relative to |0⟩. Visually, it rotates the vector around the Z-axis.',
  S: 'S Gate (Phase): Rotates the state by 90° (π/2) around the Z-axis. Also known as the sqrt(Z) gate.',
  T: 'T Gate: Rotates the state by 45° (π/4) around the Z-axis. Fundamental for universal quantum computation.',
  Measure: 'Measurement collapses the quantum state probabilistically. The qubit gives up its superposition and becomes definitively 0 or 1 based on |α|² and |β|².',
}

export function QuantumGatesPanel() {
  const { 
    qubitAlpha, qubitBeta, 
    applyHadamard, applyPauliX, applyZGate, applySGate, applyTGate,
    activeGatePulse,
    performMeasurement, resetQubit,
    quantumNoise, setQuantumNoise,
    isEntangled, toggleEntanglement
  } = useSimulationStore()
  const [lastResult, setLastResult] = useState<number | null>(null)
  const [explanation, setExplanation] = useState<string>(GATE_EXPLANATIONS['H'])
  const [measuring, setMeasuring] = useState(false)

  const isSuper = Math.abs(qubitAlpha) < 0.99 && Math.abs(qubitBeta) < 0.99

  const handleMeasure = () => {
    setMeasuring(true)
    setExplanation(GATE_EXPLANATIONS['Measure'])
    // Use the new performMeasurement for the visual flash
    performMeasurement()
    setTimeout(() => {
      const { qubitAlpha } = useSimulationStore.getState()
      setLastResult(qubitAlpha === 1 ? 0 : 1)
      setMeasuring(false)
    }, 1000)
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
        <Button variant="outline" className="h-14 flex flex-col gap-1 border-purple-500/40 hover:border-purple-500" onClick={() => { applyHadamard(); setExplanation(GATE_EXPLANATIONS['H']) }}>
          <span className="text-lg font-bold text-purple-400">H</span>
          <span className="text-[10px] text-muted-foreground">Hadamard</span>
        </Button>
        <Button variant="outline" className="h-14 flex flex-col gap-1 border-blue-500/40 hover:border-blue-500" onClick={() => { applyPauliX(); setExplanation(GATE_EXPLANATIONS['X']) }}>
          <span className="text-lg font-bold text-blue-400">X</span>
          <span className="text-[10px] text-muted-foreground">NOT</span>
        </Button>
        <Button variant="outline" className="h-14 flex flex-col gap-1 border-cyan-500/40 hover:border-cyan-500" onClick={() => { applyZGate(); setExplanation(GATE_EXPLANATIONS['Z']) }}>
          <span className="text-lg font-bold text-cyan-400">Z</span>
          <span className="text-[10px] text-muted-foreground">Phase Flip</span>
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-14 flex flex-col gap-1 border-pink-500/40 hover:border-pink-500" onClick={() => { applySGate(); setExplanation(GATE_EXPLANATIONS['S']) }}>
            <span className="text-lg font-bold text-pink-400">S</span>
          </Button>
          <Button variant="outline" className="h-14 flex flex-col gap-1 border-emerald-500/40 hover:border-emerald-500" onClick={() => { applyTGate(); setExplanation(GATE_EXPLANATIONS['T']) }}>
            <span className="text-lg font-bold text-emerald-400">T</span>
          </Button>
        </div>
        <Button variant="outline" className="h-12 flex flex-col gap-1 col-span-2 border-orange-500/40 hover:border-orange-500" onClick={handleMeasure} disabled={measuring}>
          <div className="flex items-center gap-2">
            {measuring ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" /> : <Crosshair className="h-3 w-3 text-orange-400" />}
            <span className="text-[10px] font-bold text-muted-foreground">MEASURE</span>
          </div>
        </Button>
      </div>

      {/* Pulse Waveform Visualizer */}
      <AnimatePresence>
        {activeGatePulse && (
          <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0 }} className="h-8 flex items-center justify-center gap-0.5 overflow-hidden">
             {[...Array(12)].map((_, i) => (
               <motion.div key={i} animate={{ height: [4, 24, 4] }} transition={{ repeat: Infinity, duration: 0.3, delay: i * 0.02 }} className="w-1 bg-purple-500/60 rounded-full" />
             ))}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Advanced Research Controls */}
      <div className="space-y-4 pt-4 border-t border-border/60">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1.5">
              <Waves className="h-3 w-3 text-blue-400" />
              Environment Noise
            </Label>
            <span className="text-[10px] font-mono text-blue-400">{(quantumNoise * 100).toFixed(0)}%</span>
          </div>
          <Slider 
            value={[quantumNoise * 100]} 
            max={100} 
            step={1} 
            onValueChange={(val) => setQuantumNoise(val[0] / 100)}
            className="py-2"
          />
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
          <div className="flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-foreground">Entangle Qubits</span>
              <span className="text-[9px] text-muted-foreground">Bell State (Φ+)</span>
            </div>
          </div>
          <Switch 
            checked={isEntangled} 
            onCheckedChange={toggleEntanglement} 
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="flex-1 rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
        <div className="flex items-center gap-1 mb-2">
          <Zap className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Quantum Insight</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed italic">"{explanation}"</p>
      </div>
    </div>
  )
}
