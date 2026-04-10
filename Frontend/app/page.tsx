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
import { QuantumGatesPanel } from '@/components/simulator/quantum-gates-panel'
import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/lib/simulation-store'
import { HardwareModeBar } from '@/components/hardware/HardwareModeBar'
import { HardwareMonitor } from '@/components/hardware/HardwareMonitor'
import { VirtualLEDPanel } from '@/components/hardware/VirtualLEDPanel'
import { QuantumControls } from '@/components/hardware/QuantumControls'

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

const BlochSphere = dynamic(
  () => import('@/components/simulator/bloch-sphere').then(mod => ({ default: mod.BlochSphere })),
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
    quantumMode,
    setTabActive,
    stepClock,
    resetSimulation,
    setDetectedCircuit,
    circuitType,
    numFlipFlops,
    setProjectId,
  } = useSimulationStore()
  
  const [showHero, setShowHero] = useState(true)
  const [showControlPanel, setShowControlPanel] = useState(true)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [showHardwareMonitor, setShowHardwareMonitor] = useState(false)
  const [showTimingDiagram, setShowTimingDiagram] = useState(true)
  const [showLEDPanel, setShowLEDPanel] = useState(true)
  const [controlPanelWidth, setControlPanelWidth] = useState(280)
  const [timingDiagramHeight, setTimingDiagramHeight] = useState(256)
  const [ledPanelHeight, setLedPanelHeight] = useState(120)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('projectId')
    if (id) {
      setProjectId(id)
    }
  }, [setProjectId])

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



  if (!isMounted) return <CanvasLoader />

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Top Navigation */}
      <div className="flex items-center border-b border-border w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex-1 min-w-max">
          <NavigationBar onDebugClick={() => setShowDebugPanel(!showDebugPanel)} />
        </div>
        <div className="shrink-0 px-3 border-l border-border bg-card/50 h-14 flex items-center">
          <HardwareModeBar
            onMonitorClick={() => setShowHardwareMonitor(!showHardwareMonitor)}
            monitorOpen={showHardwareMonitor}
          />
        </div>
      </div>

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
        {/* Left Control Panel - Sliding & Resizable */}
        <div 
          className="flex flex-col border-r border-border relative group transition-all duration-300 ease-in-out overflow-hidden" 
          style={{ width: showControlPanel ? `${controlPanelWidth}px` : '0px' }}
        >
          <div className="w-[280px] h-full overflow-hidden" style={{ width: `${controlPanelWidth}px` }}>
            <ControlPanel />
          </div>
          
          {/* Resize Handle (Vertical) */}
          {showControlPanel && (
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
              className="absolute right-0 top-0 bottom-0 w-1.5 bg-border hover:bg-primary cursor-col-resize z-50 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}

          {/* Toggle Button (Slide out) */}
          <button
            onClick={() => setShowControlPanel(false)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 h-12 w-3 bg-secondary border border-border rounded-l flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50"
          >
            <span className="text-[10px] text-muted-foreground">‹</span>
          </button>
        </div>

        {/* Restore Control Panel Tab */}
        {!showControlPanel && (
          <button
            onClick={() => setShowControlPanel(true)}
            className="w-8 shrink-0 flex items-center justify-center border-r border-border bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer group"
            title="Expand Control Panel"
          >
            <span className="writing-vertical text-[10px] font-bold tracking-widest text-muted-foreground uppercase group-hover:text-primary">
              Control
            </span>
          </button>
        )}

        {/* Center Panels with Tabs */}
        <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
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
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className={`flex flex-1 flex-col min-h-0 overflow-hidden ${tabActive !== 'Simulation' ? 'hidden' : ''}`}>
              {/* Quantum Mode — split layout */}
              <div className={`flex flex-1 overflow-hidden ${!quantumMode ? 'hidden' : ''}`}>
                <div className="flex-1 border-r border-border overflow-hidden">
                  <BlochSphere />
                </div>
                <div className="w-72 shrink-0 overflow-y-auto border-l border-border bg-card flex flex-col">
                  <div className="flex-1 overflow-y-auto">
                    <QuantumGatesPanel />
                  </div>
                  <div className="shrink-0 p-3 border-t border-border">
                    <QuantumControls />
                  </div>
                </div>
              </div>

              {/* Classical Mode */}
              <div className={`flex-1 overflow-hidden flex flex-col ${quantumMode ? 'hidden' : ''}`}>
                <div className="flex-1 overflow-hidden relative">
                  <div className={`absolute inset-0 ${viewMode !== 'simulator' ? 'hidden' : ''}`}>
                    <CircuitCanvas />
                  </div>
                  <div className={`absolute inset-0 ${viewMode === 'simulator' ? 'hidden' : ''}`}>
                    <CircuitBuilder />
                  </div>
                </div>
                
                {/* Timing Diagram - Sliding & Resizable */}
                <div 
                  className="border-t border-border relative group transition-all duration-300 ease-in-out" 
                  style={{ height: showTimingDiagram ? `${timingDiagramHeight}px` : '0px' }}
                >
                  {/* Resize Handle (Horizontal) */}
                  {showTimingDiagram && (
                    <div
                      onMouseDown={(e) => {
                        const startY = e.clientY
                        const startHeight = timingDiagramHeight
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const diff = startY - moveEvent.clientY
                          setTimingDiagramHeight(Math.max(120, Math.min(600, startHeight + diff)))
                        }
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove)
                          document.removeEventListener('mouseup', handleMouseUp)
                        }
                        document.addEventListener('mousemove', handleMouseMove)
                        document.addEventListener('mouseup', handleMouseUp)
                      }}
                      className="absolute left-0 right-0 -top-1 h-2 bg-border hover:bg-primary cursor-row-resize z-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                  
                  {/* Collapse Toggle */}
                  {showTimingDiagram && (
                    <button
                      onClick={() => setShowTimingDiagram(false)}
                      className="absolute left-1/2 -translate-x-1/2 -top-3 h-3 w-12 bg-secondary border border-border rounded-t flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50"
                    >
                      <span className="text-[10px] text-muted-foreground leading-none">▾</span>
                    </button>
                  )}

                  <div className="h-full w-full overflow-hidden">
                    <TimingDiagram />
                  </div>
                </div>

                {/* Virtual LED Panel - Sliding & Resizable */}
                <div 
                  className="border-t border-border relative group transition-all duration-300 ease-in-out" 
                  style={{ height: showLEDPanel ? `${ledPanelHeight}px` : '0px' }}
                >
                  {/* Resize Handle (Horizontal) */}
                  {showLEDPanel && (
                    <div
                      onMouseDown={(e) => {
                        const startY = e.clientY
                        const startHeight = ledPanelHeight
                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const diff = startY - moveEvent.clientY
                          setLedPanelHeight(Math.max(80, Math.min(300, startHeight + diff)))
                        }
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove)
                          document.removeEventListener('mouseup', handleMouseUp)
                        }
                        document.addEventListener('mousemove', handleMouseMove)
                        document.addEventListener('mouseup', handleMouseUp)
                      }}
                      className="absolute left-0 right-0 -top-1 h-2 bg-border hover:bg-primary cursor-row-resize z-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  )}
                  
                  {/* Collapse Toggle */}
                  {showLEDPanel && (
                    <button
                      onClick={() => setShowLEDPanel(false)}
                      className="absolute left-1/2 -translate-x-1/2 -top-3 h-3 w-12 bg-secondary border border-border rounded-t flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50"
                      title="Collapse LED Panel"
                    >
                      <span className="text-[10px] text-muted-foreground leading-none">▾</span>
                    </button>
                  )}

                  <div className="h-full w-full overflow-hidden bg-card/50 px-4 py-2">
                    <VirtualLEDPanel />
                  </div>
                </div>

                {/* Restore Tabs (Bottom) */}
                <div className="flex shrink-0">
                  {!showTimingDiagram && (
                    <button 
                      onClick={() => setShowTimingDiagram(true)}
                      className="flex-1 h-8 border-t border-border bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center cursor-pointer group transition-colors"
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase group-hover:text-primary">
                        Timing Diagram
                      </span>
                    </button>
                  )}
                  {!showLEDPanel && (
                    <button 
                      onClick={() => setShowLEDPanel(true)}
                      className={`flex-1 h-8 border-t border-border bg-secondary/20 hover:bg-secondary/40 flex items-center justify-center cursor-pointer group transition-colors ${!showTimingDiagram ? 'border-l' : ''}`}
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase group-hover:text-primary">
                        LED Panel
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {tabActive !== 'Simulation' && (
              <div className="flex-1 overflow-y-auto w-full relative">
                {tabActive === 'Analysis' && <AnalysisPanel />}
                {tabActive === 'Library' && <CircuitLibrary />}
                {tabActive === 'Challenges' && <ChallengesPanel />}
              </div>
            )}
          </div>
        </div>

        {/* Right Debug Panel */}
        {showDebugPanel && (
          <div className="w-80 shrink-0 border-l border-border bg-card overflow-hidden">
            <AIDebugPanel onClose={() => setShowDebugPanel(false)} />
          </div>
        )}

        {/* Right Hardware Monitor */}
        {showHardwareMonitor && (
          <div className="w-72 shrink-0 border-l border-border bg-card overflow-hidden">
            <HardwareMonitor onClose={() => setShowHardwareMonitor(false)} />
          </div>
        )}
      </div>
    </div>
  )
}
