'use client'

import { useEffect, useRef } from 'react'
import { useSimulationStore } from '@/lib/simulation-store'

interface LEDProps {
  value: 0 | 1
  index: number
  label?: string
}

function LED({ value, index, label }: LEDProps) {
  const prevRef = useRef(value)
  const isChanging = prevRef.current !== value

  useEffect(() => {
    prevRef.current = value
  }, [value])

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative h-6 w-6 rounded-full transition-all duration-150 ease-out"
        style={
          value === 1
            ? {
                backgroundColor: '#00ff88',
                boxShadow: '0 0 8px 2px #00ff8899, 0 0 18px 4px #00ff8844',
              }
            : {
                backgroundColor: '#0d2137',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.6)',
                border: '1px solid #1e3a52',
              }
        }
      >
        {/* Inner specular highlight */}
        <div
          className="absolute top-1 left-1.5 h-1.5 w-2 rounded-full opacity-40"
          style={{ backgroundColor: value === 1 ? '#caffea' : '#2a4a60' }}
        />
      </div>
      <span className="font-mono text-[9px] text-muted-foreground">
        {label ?? `Q${index}`}
      </span>
    </div>
  )
}

export function VirtualLEDPanel() {
  const { flipFlops, hardwareMode, hardwareConnected } = useSimulationStore()

  const isActive = hardwareMode || hardwareConnected

  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <div
            className={`h-2 w-2 rounded-full ${isActive ? 'bg-[#00ff88] animate-pulse' : 'bg-muted'}`}
            style={isActive ? { boxShadow: '0 0 6px #00ff88aa' } : {}}
          />
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            LED Output Register
          </h4>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground">
          {flipFlops.map((ff) => ff.q).join('')}
        </span>
      </div>

      <div className="flex items-end gap-3 px-1">
        {flipFlops.map((ff, i) => (
          <LED key={ff.id} value={ff.q as 0 | 1} index={i} />
        ))}
      </div>

      {!isActive && (
        <p className="text-[9px] text-muted-foreground italic">
          Switch to Virtual or Real mode to sync LEDs.
        </p>
      )}
    </div>
  )
}
