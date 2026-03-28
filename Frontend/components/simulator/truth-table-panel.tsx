'use client'

import { useSimulationStore } from '@/lib/simulation-store'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

export function TruthTablePanel() {
  const { timingData, numFlipFlops } = useSimulationStore()

  if (!timingData || timingData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground border border-dashed rounded-lg bg-secondary/5">
        <p className="text-sm font-medium">No simulation data available</p>
        <p className="text-[11px]">Run a simulation to generate the truth table</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Sequential Truth Table</h3>
          <p className="text-[11px] text-muted-foreground">Historical state transitions across simulation cycles</p>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] text-primary bg-primary/5">
          {timingData.length} Cycles
        </Badge>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
              <TableRow className="border-b-border/50 hover:bg-transparent">
                <TableHead className="w-16 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Cycle</TableHead>
                <TableHead className="w-16 text-[10px] uppercase tracking-wider text-primary font-bold">Clock</TableHead>
                <TableHead className="w-16 text-[10px] uppercase tracking-wider text-amber-500 font-bold">Input</TableHead>
                {Array.from({ length: numFlipFlops }).map((_, i) => (
                  <TableHead key={i} className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">
                    Q{numFlipFlops - 1 - i}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {timingData.map((point, idx) => (
                <TableRow 
                  key={idx} 
                  className={`text-xs border-b-border/30 transition-colors ${
                    point.clock === 1 ? 'bg-primary/5' : ''
                  }`}
                >
                  <TableCell className="font-mono text-muted-foreground">{idx}</TableCell>
                  <TableCell>
                    <span className={`inline-flex w-4 h-4 items-center justify-center rounded text-[10px] font-bold ${
                      point.clock === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {point.clock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex w-4 h-4 items-center justify-center rounded text-[10px] font-bold ${
                      point.input === 1 ? 'bg-amber-500 text-white' : 'bg-muted text-muted-foreground'
                    }`}>
                      {point.input}
                    </span>
                  </TableCell>
                  {Array.from({ length: numFlipFlops }).map((_, i) => {
                    const val = point.outputs[numFlipFlops - 1 - i] ?? 0
                    // Check if bit changed from previous cycle
                    const prevVal = idx > 0 ? (timingData[idx-1].outputs[numFlipFlops - 1 - i] ?? 0) : val
                    const changed = idx > 0 && val !== prevVal

                    return (
                      <TableCell key={i}>
                        <span className={`inline-flex w-5 h-5 items-center justify-center rounded text-[10px] font-bold transition-all ${
                          val === 1 
                            ? 'bg-blue-600 text-white shadow-[0_0_8px_rgba(37,99,235,0.4)]' 
                            : 'bg-secondary/80 text-muted-foreground'
                        } ${changed ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}`}>
                          {val}
                        </span>
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <div className="flex items-center gap-4 px-1 pt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded bg-primary" />
          <span className="text-[10px] text-muted-foreground uppercase">High Clock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded ring-1 ring-primary ring-offset-1" />
          <span className="text-[10px] text-muted-foreground uppercase">Bit Transition</span>
        </div>
      </div>
    </div>
  )
}
