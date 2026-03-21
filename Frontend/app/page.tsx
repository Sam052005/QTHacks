'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { NavigationBar } from '@/components/simulator/navigation-bar'
import { ControlPanel } from '@/components/simulator/control-panel'
import { TimingDiagram } from '@/components/simulator/timing-diagram'
import { AIDebugPanel } from '@/components/simulator/ai-debug-panel'
import { AnalysisPanel } from '@/components/simulator/analysis-panel'
import { CircuitLibrary } from '@/components/simulator/circuit-library'
import { ChallengesPanel } from '@/components/simulator/challenges-panel'
import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/lib/simulation-store'

// Import BrandedHero as dynamic to avoid cache issues
const BrandedHero = dynamic(
  () => import('@/components/simulator/branded-hero').then(mod => ({ default: mod.BrandedHero })),
  { ssr: true }
)

// Dynamic imports for heavy 3D components
const CircuitCanvas = dynamic(
  () => import('@/components/simulator/circuit-canvas').then(mod => ({ default: mod.CircuitCanvas })),
  { ssr: false, loading: () => <CanvasLoader /> }
)

const CircuitBuilder = dynamic(
  () => import('@/components/simulator/circuit-builder').then(mod => ({ default: mod.CircuitBuilder })),
  { ssr: false, loading: () => <CanvasLoader /> }
)

function CanvasLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#0a0f1a] to-[#0f172a]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading simulator...</p>
      </div>
    </div>
  )
}

export default function SimulatorPage() {
  // v2 - With collapsible panels and debug controls
  const { 
    isRunning, 
    isPaused, 
    clockFrequency, 
    simulationCycles,
    currentCycle,
    viewMode,
    tabActive,
    setTabActive,
    stepClock,
    resetSimulation,
    setDetectedCircuit,
    circuitType,
    numFlipFlops,
  } = useSimulationStore()
  
  const [showHero, setShowHero] = useState(true)
  const [showControlPanel, setShowControlPanel] = useState(true)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [controlPanelWidth, setControlPanelWidth] = useState(280)
  const [isMounted, setIsMounted] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-detect circuit type
  useEffect(() => {
    if (circuitType === 'Shift Register') {
      setDetectedCircuit(`${numFlipFlops}-bit Shift Register`)
    } else if (circuitType === 'Ring Counter') {
      setDetectedCircuit(`${numFlipFlops}-bit Ring Counter`)
    } else if (circuitType === 'Johnson Counter') {
      setDetectedCircuit(`${numFlipFlops}-bit Johnson Counter`)
    } else {
      setDetectedCircuit(circuitType)
    }
  }, [circuitType, numFlipFlops, setDetectedCircuit])

  // Simulation loop
  useEffect(() => {
    if (isRunning && !isPaused && currentCycle < simulationCycles) {
      intervalRef.current = setInterval(() => {
        stepClock()
      }, 1000 / clockFrequency)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, clockFrequency, currentCycle, simulationCycles, stepClock])

  // Auto-stop when simulation completes
  useEffect(() => {
    if (currentCycle >= simulationCycles && isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentCycle, simulationCycles, isRunning])

  if (!isMounted) return <CanvasLoader />

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navigation */}
      <NavigationBar onDebugClick={() => setShowDebugPanel(!showDebugPanel)} />

      {/* Branded Hero - Collapsible */}
      {showHero && (
        <div className="relative border-b border-border">
          <BrandedHero />
          <button
            onClick={() => setShowHero(false)}
            className="absolute top-3 right-3 p-1 rounded hover:bg-secondary transition-colors"
            title="Collapse hero section"
          >
            <span className="text-sm text-muted-foreground">×</span>
          </button>
        </div>
      )}

      {/* Show Hero Button */}
      {!showHero && (
        <button
          onClick={() => setShowHero(true)}
          className="px-3 py-1 text-xs text-muted-foreground hover:text-foreground border-b border-border bg-secondary/30"
        >
          Show Details
        </button>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Control Panel - Expandable */}
        {showControlPanel && (
          <div className="flex flex-col border-r border-border relative group" style={{ width: `${controlPanelWidth}px` }}>
            <ControlPanel />
            {/* Resize Handle */}
            <div
              onMouseDown={(e) => {
                const startX = e.clientX
                const startWidth = controlPanelWidth
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const diff = moveEvent.clientX - startX
                  setControlPanelWidth(Math.max(200, Math.min(500, startWidth + diff)))
                }
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }
                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              }}
              className="absolute right-0 top-0 bottom-0 w-1 bg-border hover:bg-primary cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}

        {/* Toggle Control Panel Button */}
        {!showControlPanel && (
          <button
            onClick={() => setShowControlPanel(true)}
            className="px-2 py-2 text-xs text-muted-foreground hover:text-foreground border-r border-border bg-secondary/30 writing-vertical"
          >
            Panel
          </button>
        )}

        {/* Center Panels with Tabs */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 border-b border-border bg-secondary/30 px-4 py-2">
            {(['Simulation', 'Analysis', 'Library', 'Challenges'] as const).map((tab) => (
              <Button
                key={tab}
                variant={tabActive === tab ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTabActive(tab)}
                className="text-xs"
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {tabActive === 'Simulation' && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-hidden">
                  {viewMode === 'simulator' ? (
                    <CircuitCanvas />
                  ) : (
                    <CircuitBuilder />
                  )}
                </div>
                <div className="h-64 shrink-0">
                  <TimingDiagram />
                </div>
              </div>
            )}
            
            {tabActive === 'Analysis' && <AnalysisPanel />}
            {tabActive === 'Library' && <CircuitLibrary />}
            {tabActive === 'Challenges' && <ChallengesPanel />}
          </div>
        </div>

        {/* Right Debug Panel */}
        {showDebugPanel && (
          <div className="w-80 shrink-0">
            <AIDebugPanel onClose={() => setShowDebugPanel(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
