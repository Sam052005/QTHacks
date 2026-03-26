'use client'

import { Settings, Zap, Activity, Eye, Cpu } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useSimulationStore } from '@/lib/simulation-store'
import { HardwareToggle } from '@/components/simulator/hardware-toggle'

export function ControlPanel() {
  const {
    numFlipFlops,
    simulationCycles,
    clockFrequency,
    inputBitSequence,
    showPropagationDelay,
    showSignalFlow,
    autoDetectCircuit,
    flipFlops,
    detectedCircuit,
    currentCycle,
    setNumFlipFlops,
    setSimulationCycles,
    setClockFrequency,
    setInputBitSequence,
    togglePropagationDelay,
    toggleSignalFlow,
    toggleAutoDetect,
    resetSimulation,
    isRunning,
    glitchMode,
    setGlitchMode,
  } = useSimulationStore()

  const handleParamChange = (action: () => void) => {
    if (isRunning) resetSimulation()
    action()
  }

  return (
    <aside className="flex w-full h-full flex-col border-r border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Settings className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-foreground">Control Panel</h2>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Hardware Integration Section */}
        <HardwareToggle />

        <Separator />

        {/* Input Configuration */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Zap className="h-4 w-4 text-accent" />
            Input Configuration
          </h3>
          
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Input Bit Sequence
            </Label>
            <Input
              value={inputBitSequence}
              onChange={(e) => handleParamChange(() => setInputBitSequence(e.target.value.replace(/[^01]/g, '')))}
              placeholder="e.g., 10110100"
              className="font-mono text-sm bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Number of Flip-Flops: {numFlipFlops}
            </Label>
            <Slider
              value={[numFlipFlops]}
              onValueChange={([v]) => handleParamChange(() => setNumFlipFlops(v))}
              min={1}
              max={8}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Simulation Cycles: {simulationCycles}
            </Label>
            <Slider
              value={[simulationCycles]}
              onValueChange={([v]) => handleParamChange(() => setSimulationCycles(v))}
              min={4}
              max={32}
              step={4}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Clock Frequency: {clockFrequency} Hz
            </Label>
            <Slider
              value={[clockFrequency]}
              onValueChange={([v]) => setClockFrequency(v)}
              min={0.5}
              max={10}
              step={0.5}
              className="py-2"
            />
          </div>
        </div>

        <Separator />

        {/* Feature Toggles */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Activity className="h-4 w-4 text-accent" />
            Simulation Options
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Propagation Delay
              </Label>
              <Switch
                checked={showPropagationDelay}
                onCheckedChange={togglePropagationDelay}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Signal Flow Animation
              </Label>
              <Switch
                checked={showSignalFlow}
                onCheckedChange={toggleSignalFlow}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Auto Circuit Detection
              </Label>
              <Switch
                checked={autoDetectCircuit}
                onCheckedChange={toggleAutoDetect}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Current State Display */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Eye className="h-4 w-4 text-accent" />
            Current State
          </h3>
          
          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <div className="mb-2 text-xs text-muted-foreground">
              Cycle: <span className="font-mono text-primary">{currentCycle}</span>
            </div>
            <div className="space-y-1.5">
              {flipFlops.map((ff, i) => (
                <div
                  key={ff.id}
                  className="flex items-center justify-between font-mono text-sm"
                >
                  <span className="text-muted-foreground">FlipFlop{i + 1}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      ff.q === 1
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    Q={ff.q}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Glitch Simulation Toggle */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Zap className="h-4 w-4 text-yellow-400" />
            Glitch Simulation
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-foreground">Enable Glitch Mode</Label>
              <p className="text-[10px] text-muted-foreground">Injects random ±1-cycle signal jitter</p>
            </div>
            <Switch
              checked={glitchMode}
              onCheckedChange={setGlitchMode}
            />
          </div>
          {glitchMode && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
              <p className="text-[10px] text-yellow-400 font-medium animate-pulse">⚡ Glitch mode active — signals may flicker</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Circuit Detection */}
        {autoDetectCircuit && detectedCircuit && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Cpu className="h-4 w-4 text-primary" />
              Circuit Detection
            </h3>
            
            <div className="rounded-md border border-primary/30 bg-primary/10 p-3">
              <p className="text-xs text-primary">
                Detected circuit: <span className="font-semibold">{detectedCircuit}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
