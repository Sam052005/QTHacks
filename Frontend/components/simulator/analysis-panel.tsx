'use client'

import { useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '@/components/ui/card'
import { useSimulationStore } from '@/lib/simulation-store'
import { RealWorldPanel } from './real-world-panel'
import { TruthTablePanel } from './truth-table-panel'
import { Binary } from 'lucide-react'

const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#a855f7', '#ec4899']

interface StateTransitionData {
  cycle: number
  state: string
  count: number
}

interface SignalDistribution {
  signal: string
  count: number
  percentage: number
}

interface PerformanceMetrics {
  time: number
  propagationDelay: number
  clockPulses: number
  stateChanges: number
}

export function AnalysisPanel() {
  const { timingData, flipFlops, currentCycle, simulationCycles, circuitType } = useSimulationStore()

  // State transition table data
  const stateTransitions = useMemo(() => {
    const states: Record<string, number> = {}
    timingData.forEach((point) => {
      // Correctly format the state string from outputs array
      const stateStr = Array.isArray(point.outputs) ? point.outputs.join('') : 'Unknown'
      states[stateStr] = (states[stateStr] || 0) + 1
    })
    return Object.entries(states).map(([state, count]) => ({
      state,
      count,
      percentage: timingData.length > 0 ? (count / timingData.length) * 100 : 0,
    })).sort((a, b) => b.count - a.count)
  }, [timingData])

  // Signal frequency distribution
  const signalDistribution = useMemo(() => {
    let highCount = 0
    let lowCount = 0
    timingData.forEach((point) => {
      if (point.input === 1) highCount++
      else lowCount++
    })
    return [
      { signal: 'High (1)', count: highCount, percentage: timingData.length > 0 ? (highCount / timingData.length) * 100 : 0 },
      { signal: 'Low (0)', count: lowCount, percentage: timingData.length > 0 ? (lowCount / timingData.length) * 100 : 0 },
    ]
  }, [timingData])

  // Performance metrics over time
  const performanceMetrics = useMemo(() => {
    return Array.from({ length: Math.min(16, currentCycle + 1) }, (_, i) => ({
      time: i,
      propagationDelay: 10 + Math.sin(i / 4) * 5,
      clockPulses: (i % 2) * 20,
      stateChanges: Math.floor(Math.random() * 5),
    }))
  }, [currentCycle])

  // Output frequency (toggles per cycle) by flip-flop
  const outputFrequency = useMemo(() => {
    // Determine the number of output signals to track
    // Use the maximum of store's flipFlop count and actual data in timingData
    const dataOutputCount = timingData[0]?.outputs?.length || 0
    const count = Math.max(flipFlops.length, dataOutputCount)
    
    if (count === 0) return []

    return Array.from({ length: count }).map((_, idx) => {
      let transitions = 0
      let validDataPoints = 0
      
      for (let i = 1; i < timingData.length; i++) {
        const prev = timingData[i-1].outputs?.[idx]
        const curr = timingData[i].outputs?.[idx]
        
        if (prev !== undefined && curr !== undefined) {
          validDataPoints++
          // Count 0 -> 1 transitions (positive edges)
          if (prev === 0 && curr === 1) {
            transitions++
          }
        }
      }
      
      const ones = timingData.filter((point) => point.outputs?.[idx] === 1).length
      
      const totalPoints = timingData.length
      return {
        name: `Q${idx + 1}`,
        'Transitions': transitions,
        'High %': totalPoints > 0 ? (ones / totalPoints) * 100 : 0,
        // Relative frequency (normalized to 0-100 range for the chart)
        relativeFreq: totalPoints > 1 ? (transitions / (totalPoints / 2)) * 100 : 0
      }
    })
  }, [timingData, flipFlops])

  // Circuit statistics
  const statistics = useMemo(() => {
    let totalTransitions = 0
    flipFlops.forEach((_, idx) => {
      for (let i = 1; i < timingData.length; i++) {
        if (timingData[i-1].outputs[idx] === 0 && timingData[i].outputs[idx] === 1) {
          totalTransitions++
        }
      }
    })
    
    return {
      totalCycles: currentCycle,
      clockPulses: timingData.length,
      uniqueStates: new Set(timingData.map((t) => Array.isArray(t.outputs) ? t.outputs.join('') : JSON.stringify(t.outputs))).size,
      averageFrequency: timingData.length > 0 ? (totalTransitions / timingData.length).toFixed(2) : '0',
    }
  }, [currentCycle, timingData, flipFlops])

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Circuit Analysis Dashboard</h2>
        <p className="text-sm text-muted-foreground">Real-time statistics and performance metrics • {circuitType}</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-card/50 border-border">
          <div className="text-xs text-muted-foreground mb-1">Total Cycles</div>
          <div className="text-2xl font-bold text-primary">{statistics.totalCycles}</div>
          <div className="text-xs text-muted-foreground mt-2">Simulated</div>
        </Card>
        <Card className="p-4 bg-card/50 border-border">
          <div className="text-xs text-muted-foreground mb-1">Clock Pulses</div>
          <div className="text-2xl font-bold text-accent">{statistics.clockPulses}</div>
          <div className="text-xs text-muted-foreground mt-2">Generated</div>
        </Card>
        <Card className="p-4 bg-card/50 border-border">
          <div className="text-xs text-muted-foreground mb-1">Unique States</div>
          <div className="text-2xl font-bold text-green-500">{statistics.uniqueStates}</div>
          <div className="text-xs text-muted-foreground mt-2">Detected</div>
        </Card>
        <Card className="p-4 bg-card/50 border-border">
          <div className="text-xs text-muted-foreground mb-1">Avg Frequency</div>
          <div className="text-2xl font-bold text-orange-500">{statistics.averageFrequency}</div>
          <div className="text-xs text-muted-foreground mt-2">Hz</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Input Signal Distribution - Pie Chart */}
        <Card className="p-4 bg-card border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Input Signal Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={signalDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
              >
                {signalDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} samples`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1 text-xs">
            {signalDistribution.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-muted-foreground">{item.signal}</span>
                <span className="font-mono text-foreground">{item.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Output Frequency - Bar Chart */}
        <Card className="p-4 bg-card border-border min-h-[300px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-foreground">Output Dynamics by Flip-Flop</h3>
            <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Toggles & Duty Cycle</span>
          </div>
          {outputFrequency.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={outputFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar name="Duty Cycle %" dataKey="High %" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar name="Freq Switch %" dataKey="relativeFreq" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-muted/20 rounded-xl">
              <div className="text-xs text-muted-foreground w-48 italic">
                No output data available yet. Please run the simulation to see flip-flop analytics.
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Performance Metrics - Area Chart */}
        <Card className="p-4 bg-card border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Performance Metrics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={performanceMetrics}>
              <defs>
                <linearGradient id="colorDelay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Area type="monotone" dataKey="propagationDelay" stroke="#22c55e" fillOpacity={1} fill="url(#colorDelay)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Timing Progression - Line Chart */}
        <Card className="p-4 bg-card border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Cycle Progression</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
              <Legend />
              <Line type="monotone" dataKey="clockPulses" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="stateChanges" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* State Transition Table */}
      <Card className="p-4 bg-card border-border">
        <h3 className="text-sm font-semibold text-foreground mb-4">State Transitions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">Cycle</th>
                <th className="text-left px-3 py-2 text-muted-foreground font-medium">State</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Count</th>
                <th className="text-right px-3 py-2 text-muted-foreground font-medium">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {stateTransitions.slice(0, 8).map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="px-3 py-2 text-foreground">{idx + 1}</td>
                  <td className="px-3 py-2 text-foreground">
                    <span className="font-mono bg-secondary px-2 py-0.5 rounded text-primary">
                      {row.state}
                    </span>
                  </td>
                  <td className="text-right px-3 py-2 text-foreground font-mono">{row.count}</td>
                  <td className="text-right px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground min-w-10 text-right">
                        {row.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stateTransitions.length > 8 && (
          <div className="text-center text-xs text-muted-foreground mt-3">
            +{stateTransitions.length - 8} more states
          </div>
        )}
      </Card>

      {/* NEW: Truth Table Analysis */}
      <Card className="border-border/60 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden border-t-4 border-t-primary mb-6">
        <div className="p-4 border-b border-border/40 bg-secondary/20 flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/15 text-primary">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight text-foreground lowercase">Cycle History Analysis</h3>
            <p className="text-xs text-muted-foreground">Complete trace of all internal and external signals</p>
          </div>
        </div>
        <div className="p-6">
          <TruthTablePanel />
        </div>
      </Card>

      {/* Real-World Mapping Section */}
      <Card className="border-border bg-card/40 border-dashed">
        <RealWorldPanel />
      </Card>
    </div>
  )
}
