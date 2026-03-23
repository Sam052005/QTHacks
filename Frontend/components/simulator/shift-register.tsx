'use client'

import { Float } from '@react-three/drei'
import { useSimulationStore } from '@/lib/simulation-store'
import { FlipFlopBlock } from './flip-flop-block'
import { SignalPulse } from './signal-pulse'

export function ShiftRegisterVisual() {
  const { flipFlops, circuitType, showSignalFlow, currentCycle, showPropagationDelay } = useSimulationStore()
  
  const flipFlopSpacing = 2.8
  const startX = -(flipFlops.length - 1) * flipFlopSpacing / 2

  return (
    <group>
      {/* Individual Flip-Flops */}
      {flipFlops.map((ff, i) => (
        <Float key={`ff-${ff.id}`} speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          <FlipFlopBlock
            position={[startX + i * flipFlopSpacing, 0, 0]}
            index={i}
            state={ff}
            circuitType={circuitType}
            showPropagationDelay={showPropagationDelay}
          />
        </Float>
      ))}

      {/* Bit Shifting Wires (Between Flip-Flops) */}
      {flipFlops.slice(0, -1).map((ff, i) => (
        <SignalPulse
          key={`wire-${i}`}
          startPosition={[startX + i * flipFlopSpacing + 1, 0.15, 0]}
          endPosition={[startX + (i + 1) * flipFlopSpacing - 1, 0.1, 0]}
          signalValue={ff.q}
          showPulse={showSignalFlow}
          speed={3}
        />
      ))}

      {/* Clock Lines (Shared Network to all Flops) */}
      {flipFlops.map((_, i) => (
        <SignalPulse
          key={`clock-line-${i}`}
          startPosition={[startX - 3.5, -0.35, 0]}
          endPosition={[startX + i * flipFlopSpacing - 1, -0.35, 0]}
          signalValue={currentCycle % 2 === 0 ? 1 : 0}
          showPulse={showSignalFlow}
          speed={4}
        />
      ))}

      {/* Ring / Johnson feedback loop */}
      {(circuitType === 'Ring Counter' || circuitType === 'Johnson Counter') && flipFlops.length > 1 && (
        <SignalPulse
          startPosition={[startX + (flipFlops.length - 1) * flipFlopSpacing + 1, 0.15, 0]}
          endPosition={[startX - 1, 0.1, 0]}
          signalValue={flipFlops[flipFlops.length - 1].q === (circuitType === 'Johnson Counter' ? 0 : 1) ? 1 : 0}
          showPulse={showSignalFlow}
          speed={6}
        />
      )}
    </group>
  )
}
