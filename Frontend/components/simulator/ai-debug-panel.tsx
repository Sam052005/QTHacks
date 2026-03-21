'use client'

import { useState } from 'react'
import { X, Zap, Brain, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useSimulationStore } from '@/lib/simulation-store'

const componentExplanations: Record<string, string> = {
  'D Flip-Flop': 'The D (Data) Flip-Flop captures input data on clock rising edge. Output Q follows input D when clock transitions.',
  'JK Flip-Flop': 'J-K Flip-Flop provides independent Set (J) and Reset (K) inputs. Toggle occurs when both J=1 and K=1.',
  'T Flip-Flop': 'Toggle Flip-Flop switches output state on every clock pulse when T=1. Remains unchanged when T=0.',
  'Shift Register': 'Cascaded D Flip-Flops that shift data left on each clock pulse. New input enters first stage.',
  'Ring Counter': 'Shift register with feedback. Single "1" circulates through flip-flops creating N states for N flip-flops.',
  'Johnson Counter': 'Modified ring counter using Q-bar feedback. Creates 2N unique states from N flip-flops.',
  'Clock': 'Master timing signal for synchronous circuits. Rising edge triggers all flip-flop state changes.',
  'Input Source': 'Provides data bits to circuit. Connected to D or J input of first flip-flop.',
  'Gate (AND)': 'Outputs HIGH only when ALL inputs are HIGH. Fundamental combinational logic gate.',
  'Gate (OR)': 'Outputs HIGH when ANY input is HIGH. Used for signal combination and control logic.',
  'Gate (NOT)': 'Inverter - outputs opposite of input. Converts HIGH to LOW and vice versa.',
  'Output Probe': 'Measurement point for observing signal states. Displays Q outputs in timing diagram.',
}

const signalFlowSteps = {
  'Shift Register': [
    '1. Clock signal triggers state update',
    '2. Input bit enters first flip-flop',
    '3. Previous Q₁ shifts to Q₂',
    '4. Previous Q₂ shifts to Q₃',
    '5. Previous Q₃ shifts to Q₄',
  ],
  'Ring Counter': [
    '1. Clock enables circulation',
    '2. Each flip-flop takes value from previous',
    '3. Last flip-flop feeds back to first',
    '4. Single "1" rotates through stages',
    '5. Creates recognizable counting pattern',
  ],
  'D Flip-Flop': [
    '1. Clock rising edge detected',
    '2. D input captured to output Q',
    '3. Q-bar automatically inverted',
    '4. State held until next clock pulse',
    '5. Q and Q-bar stable between clocks',
  ],
}

interface DebugPanelProps {
  onClose: () => void
}

export function AIDebugPanel({ onClose }: DebugPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('current')
  const {
    selectedComponent,
    changedComponents,
    circuitType,
    currentCycle,
    flipFlops,
    activeSignals,
    setSelectedComponent,
  } = useSimulationStore()

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const getComponentExplanation = (component: string | null): string => {
    if (!component) return 'Select a component to see AI-powered insights and logic explanations.'
    return componentExplanations[component] || 'Component information not available.'
  }

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-foreground">AI Debug Panel</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {/* Component Selection */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('current')}
            className="flex w-full items-center justify-between rounded-md bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Current Component</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === 'current' ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSection === 'current' && (
            <div className="space-y-2 pl-2">
              <div className="space-y-1.5">
                {Object.keys(componentExplanations).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => setSelectedComponent(comp)}
                    className={`w-full text-left rounded px-3 py-2 text-sm transition-colors ${
                      selectedComponent === comp
                        ? 'bg-primary/20 text-primary font-medium'
                        : 'bg-secondary/20 text-foreground hover:bg-secondary/40'
                    }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Explanation */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('explanation')}
            className="flex w-full items-center justify-between rounded-md bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Logic Explanation</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === 'explanation' ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSection === 'explanation' && (
            <div className="rounded-md border border-border/50 bg-secondary/20 p-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {getComponentExplanation(selectedComponent)}
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Signal Flow */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('flow')}
            className="flex w-full items-center justify-between rounded-md bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Signal Flow</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === 'flow' ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSection === 'flow' && (
            <div className="space-y-2">
              {(signalFlowSteps[circuitType as keyof typeof signalFlowSteps] || []).map(
                (step, i) => (
                  <div
                    key={i}
                    className="flex gap-2 rounded-md bg-secondary/20 p-2"
                  >
                    <span className="text-xs font-bold text-primary min-w-4">{i + 1}.</span>
                    <span className="text-xs text-muted-foreground">{step}</span>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Component Highlights */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('highlights')}
            className="flex w-full items-center justify-between rounded-md bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">
              Changed Components ({changedComponents.size})
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === 'highlights' ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSection === 'highlights' && (
            <div className="space-y-1.5 pl-2">
              {changedComponents.size === 0 ? (
                <p className="text-xs text-muted-foreground italic">No components changed yet</p>
              ) : (
                Array.from(changedComponents).map((comp) => (
                  <div
                    key={comp}
                    className="rounded bg-primary/20 px-2 py-1 text-xs text-primary font-mono"
                  >
                    ► {comp}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Active Signals */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('signals')}
            className="flex w-full items-center justify-between rounded-md bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">
              Active Signals ({activeSignals.length})
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === 'signals' ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSection === 'signals' && (
            <div className="space-y-1 pl-2">
              {activeSignals.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No active signals</p>
              ) : (
                activeSignals.map((signal, i) => (
                  <div key={i} className="text-xs font-mono text-accent">
                    {signal.from} → {signal.to}{' '}
                    <span className="text-muted-foreground">
                      ({Math.round(signal.progress * 100)}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Current State */}
        <div className="space-y-2">
          <button
            onClick={() => toggleSection('state')}
            className="flex w-full items-center justify-between rounded-md bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">State @ Cycle {currentCycle}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedSection === 'state' ? 'rotate-180' : ''
              }`}
            />
          </button>
          
          {expandedSection === 'state' && (
            <div className="space-y-1 pl-2">
              {flipFlops.map((ff) => (
                <div
                  key={ff.id}
                  className="flex items-center justify-between rounded bg-secondary/30 px-2 py-1"
                >
                  <span className="text-xs text-muted-foreground">FF{ff.id + 1}</span>
                  <div className="flex gap-2 font-mono text-xs">
                    <span className={ff.q === 1 ? 'text-primary font-bold' : 'text-muted-foreground'}>
                      Q={ff.q}
                    </span>
                    <span className={ff.qBar === 1 ? 'text-primary font-bold' : 'text-muted-foreground'}>
                      Q̄={ff.qBar}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
