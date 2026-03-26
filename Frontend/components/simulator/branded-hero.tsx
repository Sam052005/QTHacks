'use client'

import { Zap, Eye, CircuitBoard } from 'lucide-react'
import { Card } from '@/components/ui/card'

export function BrandedHero() {
  return (
    <div className="relative w-full bg-gradient-to-br from-primary/20 via-background to-background border-b border-border overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative px-6 py-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-3 gap-6">
          {/* Main tagline and info */}
          <div className="col-span-2">
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
              <Zap className="h-3 w-3 text-primary" />
              <span className="text-xs font-semibold text-primary">Interactive Digital Circuit Simulator</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3 mt-4">
              See the circuit <span className="text-primary">think.</span>
            </h1>
            <p className="text-base text-muted-foreground mb-6 max-w-lg">
              Real-time 3D visualization. Watch sequential logic circuits evolve in real-time with interactive step-by-step execution.
            </p>
          </div>

          {/* Quick stats */}
          <div className="space-y-2">
            <Card className="p-3 bg-card/50 border-border">
              <div className="text-xs text-muted-foreground">Engine</div>
              <div className="text-sm font-semibold text-foreground">Sequential Logic</div>
            </Card>
            <Card className="p-3 bg-card/50 border-border">
              <div className="text-xs text-muted-foreground">Visualization</div>
              <div className="text-sm font-semibold text-foreground">Real-time 3D</div>
            </Card>
            <Card className="p-3 bg-card/50 border-border">
              <div className="text-xs text-muted-foreground">Analysis</div>
              <div className="text-sm font-semibold text-foreground">Live Charts</div>
            </Card>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/50">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-primary/10">
              <CircuitBoard className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Flip-flop Simulation</h3>
              <p className="text-xs text-muted-foreground mt-0.5">D, JK, T flip-flops</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-accent/10">
              <Zap className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Shift Registers</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Ring & Johnson counters</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-green-500/10">
              <Eye className="h-4 w-4 text-green-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Timing Diagrams</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Zoomable waveforms</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 rounded-lg bg-blue-500/10">
              <CircuitBoard className="h-4 w-4 text-blue-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Step-by-Step Execution</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Clock-level control</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
