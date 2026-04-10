'use client'

import { useState } from 'react'
import { Plug, Unplug, MonitorDot, Cpu, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/lib/simulation-store'
import { setHardwareLayerMode, type HardwareLayerMode } from '@/utils/hardwareInterface'

const MODES: { value: HardwareLayerMode; label: string; short: string }[] = [
  { value: 'simulation', label: 'Simulation', short: 'Sim' },
  { value: 'virtual',    label: 'Virtual HW', short: 'Virtual' },
  { value: 'real',       label: 'Real HW',    short: 'Real' },
]

interface HardwareModeBarProps {
  onMonitorClick?: () => void
  monitorOpen?: boolean
}

export function HardwareModeBar({ onMonitorClick, monitorOpen }: HardwareModeBarProps) {
  const [activeMode, setActiveMode] = useState<HardwareLayerMode>('simulation')
  const [connecting, setConnecting] = useState(false)

  const {
    hardwareConnected,
    setHardwareConnected,
    setHardwareMode,
  } = useSimulationStore()

  const switchMode = (mode: HardwareLayerMode) => {
    setActiveMode(mode)
    setHardwareLayerMode(mode)
    // Keep the store in sync for components that read hardwareMode
    setHardwareMode(mode === 'real')
    if (mode !== 'real') {
      setHardwareConnected(mode === 'virtual')
    }
  }

  const handleConnect = async () => {
    if (activeMode === 'virtual') {
      // Virtual mode — immediately "connected"
      setHardwareConnected(true)
      return
    }

    if (activeMode === 'real') {
      setConnecting(true)
      try {
        const { serialManager } = await import('@/utils/serial')
        serialManager.setCallbacks({
          onDisconnect: () => {
            setHardwareConnected(false)
            setHardwareMode(false)
          },
        })
        const ok = await serialManager.connect()
        setHardwareConnected(ok)
        if (ok) setHardwareMode(true)
      } catch (e) {
        console.error('Hardware connect failed', e)
      } finally {
        setConnecting(false)
      }
    }
  }

  const handleDisconnect = async () => {
    if (activeMode === 'real') {
      const { serialManager } = await import('@/utils/serial')
      await serialManager.disconnect()
    }
    setHardwareConnected(false)
    setHardwareMode(false)
  }

  const modeColor =
    activeMode === 'real'
      ? 'border-[#ff5a00]/60 text-[#ff5a00]'
      : activeMode === 'virtual'
      ? 'border-[#00ff88]/60 text-[#00ff88]'
      : 'border-border text-muted-foreground'

  return (
    <div className="flex items-center gap-2">
      {/* 3-way pill toggle */}
      <div className="flex items-center gap-0.5 rounded-md border border-border bg-secondary/40 p-0.5">
        {MODES.map(({ value, short }) => (
          <button
            key={value}
            onClick={() => switchMode(value)}
            className={`rounded px-2.5 py-1 text-[10px] font-semibold transition-all duration-150 ${
              activeMode === value
                ? value === 'real'
                  ? 'bg-[#ff5a00] text-white shadow-sm'
                  : value === 'virtual'
                  ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40'
                  : 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {short}
          </button>
        ))}
      </div>

      {/* Connect / status button */}
      {activeMode !== 'simulation' && (
        hardwareConnected ? (
          <button
            onClick={handleDisconnect}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-bold transition-all ${modeColor} hover:opacity-70`}
          >
            <div className={`h-1.5 w-1.5 rounded-full animate-pulse ${activeMode === 'real' ? 'bg-[#ff5a00]' : 'bg-[#00ff88]'}`} />
            {activeMode === 'virtual' ? 'Virtual Connected' : 'USB Connected'}
            <Unplug className="h-3 w-3 ml-0.5" />
          </button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleConnect}
            disabled={connecting}
            className="h-7 gap-1.5 px-2.5 text-[10px] border-dashed hover:border-primary"
          >
            {connecting ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Plug className="h-3 w-3" />
            )}
            {activeMode === 'virtual' ? 'Enable Virtual HW' : 'Connect USB'}
          </Button>
        )
      )}

      {/* Monitor toggle */}
      <Button
        size="sm"
        variant={monitorOpen ? 'default' : 'ghost'}
        onClick={onMonitorClick}
        className="h-7 gap-1 px-2 text-[10px]"
        title="Hardware Monitor"
      >
        <MonitorDot className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Monitor</span>
      </Button>
    </div>
  )
}
