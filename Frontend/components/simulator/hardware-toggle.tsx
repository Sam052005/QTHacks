'use client'

import { useState } from 'react'
import { Plug, Unplug, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSimulationStore } from '@/lib/simulation-store'

export function HardwareToggle() {
  const { 
    hardwareConnected, 
    hardwareMode, 
    setHardwareConnected, 
    setHardwareMode 
  } = useSimulationStore()
  
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      // Dynamic import to avoid SSR issues with navigator.serial
      const { serialManager } = await import('@/utils/serial')
      const success = await serialManager.connect()
      if (success) {
        setHardwareConnected(true)
        setHardwareMode(true) // Auto-switch to hardware mode
        
        // Setup disconnection listener
        serialManager.setCallbacks({
          onDisconnect: () => {
            setHardwareConnected(false)
            setHardwareMode(false)
          }
        })
      }
    } catch (e) {
      console.error('Connection failed', e)
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    const { serialManager } = await import('@/utils/serial')
    await serialManager.disconnect()
    setHardwareConnected(false)
    setHardwareMode(false)
  }

  return (
    <div className="space-y-3 rounded-md border border-border bg-secondary/30 p-3">
      <div className="flex items-center gap-2 mb-1">
        <Plug className="h-4 w-4 text-primary" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hardware Kit</h4>
      </div>

      {/* Connect/Disconnect Section */}
      <div className="flex flex-col gap-2">
        {hardwareConnected ? (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDisconnect}
            className="w-full h-9 justify-start border-[#ff5a00]/40 text-[#ff5a00] hover:bg-[#ff5a00]/10 gap-2"
          >
            <div className="h-2 w-2 rounded-full bg-[#ff5a00] animate-pulse" />
            <span className="text-xs font-bold font-mono">USB Connected (115200)</span>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={handleConnect}
            disabled={connecting}
            className="w-full h-9 justify-start gap-2.5 border-dashed border-border hover:border-primary hover:bg-primary/5 group"
          >
            {connecting ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <Plug className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
            <span className="text-xs font-medium">Connect Hardware USB</span>
          </Button>
        )}

        {/* Mode Toggle Section (Only if connected) */}
        {hardwareConnected && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-background/50 rounded-md border border-border">
            <Button
              size="sm"
              variant={!hardwareMode ? 'default' : 'ghost'}
              onClick={() => setHardwareMode(false)}
              className="h-7 text-[10px] gap-1.5"
            >
              <Monitor className="h-3 w-3" />
              Sim
            </Button>
            <Button
              size="sm"
              variant={hardwareMode ? 'default' : 'ghost'}
              onClick={() => setHardwareMode(true)}
              className={`h-7 text-[10px] gap-1.5 ${
                hardwareMode ? 'bg-[#ff5a00] hover:bg-[#ff5a00]/90 text-white font-bold' : ''
              }`}
            >
              <Unplug className="h-3 w-3" />
              Real
            </Button>
          </div>
        )}
      </div>

      {!hardwareConnected && (
        <p className="text-[10px] text-muted-foreground italic leading-relaxed">
          Plug in your Smart Flip-Flop kit to synchronize real LEDs and buttons with this simulator.
        </p>
      )}
    </div>
  )
}
