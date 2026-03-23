'use client'

import { Play, SkipForward, RotateCcw, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/lib/simulation-store'

export function SimulationControls() {
  const { 
    isRunning, 
    isPaused, 
    startSimulation, 
    togglePause,
    stopSimulation,
    stepClock, 
    resetSimulation,
    currentCycle,
    simulationCycles
  } = useSimulationStore()

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 rounded-lg border border-primary/20 bg-background/80 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold">Simulation Control</h3>
      </div>
      
      <div className="flex flex-col gap-2">
        {!isRunning ? (
          <Button 
            variant="default"
            className="w-full justify-start gap-3 shadow-md shadow-primary/20"
            onClick={startSimulation}
          >
            <Play className="h-4 w-4" />
            Start Simulation
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant={isPaused ? "default" : "outline"}
              className="flex-1 justify-center gap-2"
              onClick={togglePause}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <div className="h-4 w-4 border-l-2 border-r-2 border-current px-0.5" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            <Button 
              variant="outline"
              className="flex-1 justify-center gap-2 text-destructive hover:bg-destructive/10"
              onClick={stopSimulation}
            >
              <div className="h-3 w-3 bg-destructive rounded-sm" />
              Stop
            </Button>
          </div>
        )}
        
        <Button 
          variant="secondary"
          className="w-full justify-start gap-3 border border-border"
          onClick={stepClock}
          disabled={!isRunning}
        >
          <SkipForward className="h-4 w-4 text-primary" />
          Next Clock Step
        </Button>
        
        <Button 
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={resetSimulation}
        >
          <RotateCcw className="h-4 w-4" />
          Reset All
        </Button>
      </div>
      
      <div className="mt-2 text-center text-xs font-mono text-muted-foreground">
        Cycle: {currentCycle} / {simulationCycles}
      </div>
    </div>
  )
}
