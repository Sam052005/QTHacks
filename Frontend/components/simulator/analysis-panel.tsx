'use client'

import { useMemo } from 'react'
import { BarChart, Bar, PieChart, Pie, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Card } from '@/components/ui/card'
import { useSimulationStore } from '@/lib/simulation-store'
import { RealWorldPanel } from './real-world-panel'

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
      const stateStr = flipFlops.map(() => '0|1').join('')
      states[stateStr] = (states[stateStr] || 0) + 1
    })
    return Object.entries(states).map(([state, count], idx) => ({
      cycle: idx,
      state: `State ${idx}`,
      count,
    }))
  }, [timingData, flipFlops])

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

  // Output frequency by flip-flop
  const outputFrequency = useMemo(() => {
    return flipFlops.map((_, idx) => {
      const ones = timingData.filter((point) => point.outputs[idx] === 1).length
      return {
        name: `Q${idx + 1}`,
        'High (1)': ones,
        'Low (0)': timingData.length - ones,
        percentage: timingData.length > 0 ? (ones / timingData.length) * 100 : 0,
      }
    })
  }, [timingData, flipFlops])

  // Circuit statistics
  const statistics = useMemo(() => {
    return {
      totalCycles: currentCycle,
      clockPulses: currentCycle,
      uniqueStates: new Set(timingData.map((t) => JSON.stringify(t.outputs))).size,
      averageFrequency: flipFlops.length > 0 ? (currentCycle / flipFlops.length).toFixed(2) : '0',
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
        <Card className="p-4 bg-card border-border">
          <h3 className="text-sm font-semibold text-foreground mb-4">Output Frequency by Flip-Flop</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={outputFrequency}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                formatter={(value) => `${((value as number) || 0).toFixed(1)}%`}
              />
              <Bar dataKey="percentage" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
                  <td className="px-3 py-2 text-foreground">{idx}</td>
                  <td className="px-3 py-2 text-foreground font-mono">{row.state}</td>
                  <td className="text-right px-3 py-2 text-foreground">{row.count}</td>
                  <td className="text-right px-3 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(row.count / Math.max(...stateTransitions.map((r) => r.count), 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground min-w-10 text-right">
                        {timingData.length > 0 ? (((row.count / timingData.length) * 100).toFixed(1)) : '0'}%
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

      {/* Real-World Mapping Section */}
      <Card className="border-border bg-card">
        <RealWorldPanel />
      </Card>
    </div>
  )
}
