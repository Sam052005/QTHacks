'use client'

import { useMemo, useState } from 'react'
import { Activity, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/lib/simulation-store'

interface WaveformProps {
  label: string
  data: number[]
  color: string
  labelColor: string
  pixelsPerUnit: number
  startIndex: number
}

function Waveform({ label, data, color, labelColor, pixelsPerUnit, startIndex }: WaveformProps) {
  const pathD = useMemo(() => {
    if (data.length === 0) return ''
    
    const height = 24
    const visibleData = data.slice(startIndex, startIndex + Math.ceil(800 / pixelsPerUnit))
    
    let d = `M 0 ${visibleData[0] === 1 ? 4 : height - 4}`
    
    visibleData.forEach((value, i) => {
      const x = i * pixelsPerUnit
      const midX = i * pixelsPerUnit + pixelsPerUnit / 2
      const nextX = (i + 1) * pixelsPerUnit
      
      if (label === 'CLK') {
        // Synthesize a square wave for each clock cycle
        // Rising edge at start, falling edge at midpoint
        d += ` L ${x} 4`
        d += ` L ${midX} 4`
        d += ` L ${midX} ${height - 4}`
        d += ` L ${nextX} ${height - 4}`
      } else {
        const y = value === 1 ? 4 : height - 4
        const prevY = i > 0 ? (visibleData[i - 1] === 1 ? 4 : height - 4) : y
        
        if (y !== prevY) {
          d += ` L ${x} ${y}`
        }
        d += ` L ${nextX} ${y}`
      }
    })
    
    return d
  }, [data, pixelsPerUnit, startIndex])

  return (
    <div className="flex items-center gap-3 border-b border-border/50 last:border-0">
      <div className="w-20 shrink-0 py-2 pr-2 text-right">
        <span className={`text-xs font-mono ${labelColor}`}>{label}</span>
      </div>
      <div className="flex-1 py-1">
        <svg
          width={800}
          height={28}
          className="block"
        >
          {Array.from({ length: Math.ceil(800 / pixelsPerUnit) }).map((_, i) => (
            <line
              key={i}
              x1={i * pixelsPerUnit}
              y1={0}
              x2={i * pixelsPerUnit}
              y2={28}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="2 2"
            />
          ))}
          
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          <line
            x1={0}
            y1={4}
            x2={800}
            y2={4}
            stroke="currentColor"
            strokeOpacity={0.05}
          />
          <line
            x1={0}
            y1={24}
            x2={800}
            y2={24}
            stroke="currentColor"
            strokeOpacity={0.05}
          />
        </svg>
      </div>
    </div>
  )
}

export function TimingDiagram() {
  const { timingData, flipFlops, currentCycle, simulationCycles, numFlipFlops } = useSimulationStore()
  const [pixelsPerUnit, setPixelsPerUnit] = useState(40)
  const [startIndex, setStartIndex] = useState(0)

  const clockData = useMemo(() => 
    timingData.map(t => t.clock), 
    [timingData]
  )

  const inputData = useMemo(() => 
    timingData.map(t => t.input), 
    [timingData]
  )

  const outputColors = [
    '#22c55e', // green
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f59e0b', // amber
    '#ef4444', // red
    '#6366f1', // indigo
  ]

  const outputLabelColors = [
    'text-green-400',
    'text-blue-400',
    'text-purple-400',
    'text-pink-400',
    'text-teal-400',
    'text-amber-400',
    'text-red-400',
    'text-indigo-400',
  ]

  const handleZoomIn = () => {
    setPixelsPerUnit(prev => Math.min(prev + 10, 80))
  }

  const handleZoomOut = () => {
    setPixelsPerUnit(prev => Math.max(prev - 10, 10))
  }

  const handlePanLeft = () => {
    setStartIndex(prev => Math.max(prev - 4, 0))
  }

  const handlePanRight = () => {
    const maxIndex = Math.max(0, timingData.length - Math.ceil(800 / pixelsPerUnit))
    setStartIndex(prev => Math.min(prev + 4, maxIndex))
  }

  return (
    <div className="flex flex-col h-full border-t border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Timing Diagram</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomOut}
              className="h-7 w-7 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-8 text-center">
              {Math.round((pixelsPerUnit / 40) * 100)}%
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleZoomIn}
              className="h-7 w-7 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="w-px h-4 bg-border" />
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePanLeft}
            className="h-7 w-7 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePanRight}
            className="h-7 w-7 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border" />
          <span className="text-xs text-muted-foreground">
            Cycle: <span className="font-mono text-primary">{currentCycle}</span> / {simulationCycles}
          </span>
        </div>
      </div>

      {/* Waveforms */}
      <div className="flex-1 overflow-auto relative bg-card">
        <div className="min-w-[800px]">
          {/* Time axis header */}
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/50 bg-secondary/80 backdrop-blur">
            <div className="w-20 shrink-0 py-1 pr-2 text-right sticky left-0 bg-secondary/80">
              <span className="text-xs font-mono text-muted-foreground">Signal</span>
            </div>
            <div className="flex-1">
              <div className="flex" style={{ width: 800 }}>
                {Array.from({ length: Math.ceil(800 / pixelsPerUnit) }).map((_, i) => (
                  <div 
                    key={i} 
                    className="text-center text-xs font-mono text-muted-foreground"
                    style={{ width: pixelsPerUnit }}
                  >
                    {startIndex + i}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clock signal */}
          {timingData.length > 0 ? (
            <Waveform
              label="CLK"
              data={clockData}
              color="#f97316"
              labelColor="text-orange-400"
              pixelsPerUnit={pixelsPerUnit}
              startIndex={startIndex}
            />
          ) : (
            <Waveform
              label="CLK"
              data={Array.from({ length: 8 }, (_, i) => i % 2)}
              color="#f97316"
              labelColor="text-orange-400"
              pixelsPerUnit={pixelsPerUnit}
              startIndex={startIndex}
            />
          )}

          {/* Input signal */}
          <Waveform
            label="INPUT"
            data={inputData.length > 0 ? inputData : [0, 1, 0, 1, 1, 0, 1, 0]}
            color="#fbbf24"
            labelColor="text-yellow-400"
            pixelsPerUnit={pixelsPerUnit}
            startIndex={startIndex}
          />

          {/* Flip-flop outputs */}
          {(flipFlops.length > 0 ? flipFlops : Array(numFlipFlops).fill(0)).map((_, i) => {
            const outputData = timingData.map(t => (t.outputs && t.outputs[i] !== undefined) ? t.outputs[i] : 0)
            return (
              <Waveform
                key={i}
                label={`Q${i + 1}`}
                data={outputData.length > 0 ? outputData : Array(8).fill(0)}
                color={outputColors[i % outputColors.length]}
                labelColor={outputLabelColors[i % outputLabelColors.length]}
                pixelsPerUnit={pixelsPerUnit}
                startIndex={startIndex}
              />
            )
          })}
          
          {/* Active Cycle Cursor Overlay */}
          {currentCycle >= startIndex && currentCycle <= startIndex + Math.ceil(800 / pixelsPerUnit) && (
            <div 
              className="absolute top-0 bottom-0 border-l border-primary z-10 pointer-events-none transition-all duration-300"
              style={{ left: 80 + (currentCycle - startIndex) * pixelsPerUnit }}
            >
              <div className="absolute -top-1 -left-[3px] h-2 w-2 rounded-full bg-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 border-t border-border px-4 py-2">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-sm bg-orange-500" />
          <span className="text-xs text-muted-foreground">Clock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-sm bg-yellow-500" />
          <span className="text-xs text-muted-foreground">Input</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-sm bg-green-500" />
          <span className="text-xs text-muted-foreground">High (1)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-4 rounded-sm bg-muted" />
          <span className="text-xs text-muted-foreground">Low (0)</span>
        </div>
      </div>
    </div>
  )
}
