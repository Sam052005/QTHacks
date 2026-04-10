'use client'

import { useEffect, useState } from 'react'
import { Activity, Cpu, Wifi, WifiOff } from 'lucide-react'
import { useSimulationStore } from '@/lib/simulation-store'
import { getHardwareLayerMode } from '@/utils/hardwareInterface'

interface PacketLog {
  ts: number
  type: string
  summary: string
}

const MAX_LOG = 6

export function HardwareMonitor({ onClose }: { onClose?: () => void }) {
  const {
    flipFlops,
    hardwareConnected,
    qubitAlpha,
    qubitBeta,
    isMeasured,
    measurementResult,
  } = useSimulationStore()

  const [log, setLog] = useState<PacketLog[]>([])
  const [mode, setMode] = useState(getHardwareLayerMode())

  // Refresh mode label on every render cycle
  useEffect(() => {
    const id = setInterval(() => setMode(getHardwareLayerMode()), 500)
    return () => clearInterval(id)
  }, [])

  // Watch flip-flop states and log changes
  const stateStr = flipFlops.map((f) => f.q).join('')
  useEffect(() => {
    setLog((prev) =>
      [
        {
          ts: Date.now(),
          type: 'STATE_UPDATE',
          summary: `Q[${stateStr}]`,
        },
        ...prev,
      ].slice(0, MAX_LOG)
    )
  }, [stateStr])

  const modeColor =
    mode === 'real'
      ? '#ff5a00'
      : mode === 'virtual'
      ? '#00ff88'
      : '#6b7280'

  const modeLabel =
    mode === 'real' ? 'Real Hardware' : mode === 'virtual' ? 'Virtual HW' : 'Simulation'

  return (
    <div className="flex h-full flex-col border-l border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground text-sm">Hardware Monitor</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ── Connection Status ── */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Connection
          </h3>
          <div className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
            <div className="flex items-center gap-2">
              {hardwareConnected ? (
                <Wifi className="h-4 w-4" style={{ color: modeColor }} />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs text-foreground">{modeLabel}</span>
            </div>
            <div
              className={`h-2 w-2 rounded-full ${mode !== 'simulation' ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: modeColor }}
            />
          </div>
        </section>

        {/* ── LED Output States ── */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            LED Register
          </h3>
          <div className="rounded-md border border-border bg-secondary/30 p-3">
            <div className="flex items-center gap-2 mb-3">
              {flipFlops.map((ff, i) => (
                <div key={ff.id} className="flex flex-col items-center gap-1">
                  <div
                    className="h-4 w-4 rounded-full transition-all duration-150"
                    style={
                      ff.q === 1
                        ? {
                            backgroundColor: '#00ff88',
                            boxShadow: '0 0 6px #00ff88aa',
                          }
                        : {
                            backgroundColor: '#0d2137',
                            border: '1px solid #1e3a52',
                          }
                    }
                  />
                  <span className="font-mono text-[8px] text-muted-foreground">Q{i}</span>
                </div>
              ))}
            </div>
            <div className="font-mono text-xs text-primary">
              0b{stateStr}
              <span className="ml-2 text-muted-foreground">
                (0x{parseInt(stateStr, 2).toString(16).toUpperCase().padStart(2, '0')})
              </span>
            </div>
          </div>
        </section>

        {/* ── Qubit State ── */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Qubit State
          </h3>
          <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="rounded bg-background/50 px-2 py-1.5">
                <span className="text-muted-foreground text-[9px]">α (|0⟩)</span>
                <div className="text-foreground">{qubitAlpha.toFixed(4)}</div>
                <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${Math.abs(qubitAlpha) * 100}%`,
                      backgroundColor: '#4b8eff',
                    }}
                  />
                </div>
              </div>
              <div className="rounded bg-background/50 px-2 py-1.5">
                <span className="text-muted-foreground text-[9px]">β (|1⟩)</span>
                <div className="text-foreground">{qubitBeta.toFixed(4)}</div>
                <div className="mt-1 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-150"
                    style={{
                      width: `${Math.abs(qubitBeta) * 100}%`,
                      backgroundColor: '#00ff88',
                    }}
                  />
                </div>
              </div>
            </div>
            {isMeasured && (
              <div className="text-center font-mono text-xs text-yellow-400">
                Collapsed → {measurementResult === 0 ? '|0⟩' : '|1⟩'}
              </div>
            )}
          </div>
        </section>

        {/* ── Packet Log ── */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Serial Log
          </h3>
          <div className="rounded-md border border-border bg-secondary/30 p-2 space-y-1 font-mono text-[9px]">
            {log.length === 0 && (
              <p className="text-muted-foreground italic py-1">No packets yet.</p>
            )}
            {log.map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <span className="shrink-0 text-primary/60">
                  {new Date(entry.ts).toLocaleTimeString('en', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="text-accent/80">{entry.type}</span>
                <span>{entry.summary}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
