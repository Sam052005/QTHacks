'use client'

import { Play, Pause, SkipForward, RotateCcw, Cpu, Wrench, Brain } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useSimulationStore, CircuitType } from '@/lib/simulation-store'

const circuitTypes: CircuitType[] = [
  'D Flip-Flop',
  'JK Flip-Flop',
  'T Flip-Flop',
  'Shift Register',
  'Ring Counter',
  'Johnson Counter',
]

interface NavigationBarProps {
  onDebugClick?: () => void
}

export function NavigationBar({ onDebugClick }: NavigationBarProps) {
  const {
    circuitType,
    clockFrequency,
    isRunning,
    isPaused,
    viewMode,
    setCircuitType,
    setClockFrequency,
    setViewMode,
    startSimulation,
    pauseSimulation,
    stepClock,
    resetSimulation,
  } = useSimulationStore()

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center">
          <Image 
            src="/Logo.jpeg" 
            alt="Logo" 
            width={160} 
            height={48} 
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Simulation Controls */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 p-1">
          <Button
            size="sm"
            variant={isRunning && !isPaused ? 'default' : 'ghost'}
            onClick={startSimulation}
            className="h-8 gap-1.5"
          >
            <Play className="h-4 w-4" />
            Start
          </Button>
          <Button
            size="sm"
            variant={isPaused ? 'default' : 'ghost'}
            onClick={pauseSimulation}
            disabled={!isRunning}
            className="h-8 gap-1.5"
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={stepClock}
            className="h-8 gap-1.5"
          >
            <SkipForward className="h-4 w-4" />
            Step
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetSimulation}
            className="h-8 gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Circuit Selector */}
        <Select value={circuitType} onValueChange={(v) => setCircuitType(v as CircuitType)}>
          <SelectTrigger className="w-[160px] h-8 bg-secondary/50">
            <SelectValue placeholder="Select circuit" />
          </SelectTrigger>
          <SelectContent>
            {circuitTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clock Frequency */}
        <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-1">
          <span className="text-xs text-muted-foreground">Clock:</span>
          <Slider
            value={[clockFrequency]}
            onValueChange={([v]) => setClockFrequency(v)}
            min={0.5}
            max={5}
            step={0.5}
            className="w-20"
          />
          <span className="text-xs font-mono text-foreground w-10">{clockFrequency} Hz</span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 rounded-md border border-border bg-secondary/50 p-1">
          <Button
            size="sm"
            variant={viewMode === 'simulator' ? 'default' : 'ghost'}
            onClick={() => setViewMode('simulator')}
            className="h-8 gap-1.5"
          >
            <Cpu className="h-4 w-4" />
            Simulator
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'builder' ? 'default' : 'ghost'}
            onClick={() => setViewMode('builder')}
            className="h-8 gap-1.5"
          >
            <Wrench className="h-4 w-4" />
            Builder
          </Button>
        </div>

        {/* AI Debug Panel Toggle */}
        <Button
          size="sm"
          variant="outline"
          onClick={onDebugClick}
          className="gap-1.5"
        >
          <Brain className="h-4 w-4" />
          Debug
        </Button>
      </div>
    </header>
  )
}
