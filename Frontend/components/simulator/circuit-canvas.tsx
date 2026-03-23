'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation-store'
import { ShiftRegisterVisual } from './shift-register'
import { ClockPulse } from './clock-pulse'
import { SignalPulse } from './signal-pulse'
import { SimulationControls } from './simulation-controls'


// Replaced ClockGenerator and FlipFlopModule with ClockPulse and ShiftRegisterVisual

function InputSource({ position }: { position: [number, number, number] }) {
  const { inputBitSequence, currentCycle } = useSimulationStore()
  const currentBit = parseInt(inputBitSequence[currentCycle % inputBitSequence.length] || '0')
  const isActive = currentBit === 1

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.8, 0.3]} />
        <meshStandardMaterial
          color={isActive ? '#22c55e' : '#1e3a5f'}
          metalness={0.7}
          roughness={0.3}
          emissive={isActive ? '#22c55e' : '#1e3a5f'}
          emissiveIntensity={isActive ? 0.6 : 0.1}
        />
      </mesh>
      
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
      >
        IN
      </Text>

      <Text
        position={[0, -0.6, 0.2]}
        fontSize={0.12}
        color={isActive ? '#22c55e' : '#64748b'}
        anchorX="center"
      >
        {currentBit}
      </Text>

      {/* Output node */}
      <mesh position={[0.5, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={isActive ? '#22c55e' : '#3b82f6'} 
          emissive={isActive ? '#22c55e' : '#3b82f6'} 
          emissiveIntensity={0.5} 
        />
      </mesh>
    </group>
  )
}

// Replaced Wire with SignalPulse

function GridFloor() {
  return (
    <group>
      <gridHelper 
        args={[20, 20, '#1e3a5f', '#0f172a']} 
        position={[0, -1.5, 0]}
        rotation={[0, 0, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.51, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#0a0f1a" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function Scene() {
  const { flipFlops, circuitType, showSignalFlow, inputBitSequence, currentCycle } = useSimulationStore()
  const currentBit = parseInt(inputBitSequence[currentCycle % inputBitSequence.length] || '0')
  
  const flipFlopSpacing = 2.5
  const startX = -(flipFlops.length - 1) * flipFlopSpacing / 2

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#3b82f6" />
      <spotLight
        position={[0, 10, 0]}
        intensity={0.8}
        angle={0.5}
        penumbra={1}
        castShadow
      />

      {/* Grid floor */}
      <GridFloor />

      {/* Clock generator */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <ClockPulse position={[startX - 3.5, 0, 0]} />
      </Float>

      {/* Input source */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <InputSource position={[startX - 1.5, 0.8, 0]} />
      </Float>


      {/* Wire from input to first flip-flop */}
      <SignalPulse
        startPosition={[startX - 1, 0.8, 0]}
        endPosition={[startX - 1, 0.15, 0]}
        signalValue={currentBit}
        showPulse={showSignalFlow}
      />

      {/* Shift Register Flip-Flops and Wires */}
      <ShiftRegisterVisual />


      {/* Camera controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={3}
        maxDistance={20}
        target={[0, 0, 0]}
      />
    </>
  )
}

export function CircuitCanvas() {
  return (
    <div className="relative h-full w-full bg-gradient-to-b from-[#0a0f1a] to-[#0f172a]">
      {/* Simulation Controls HUD */}
      <SimulationControls />

      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <Scene />
      </Canvas>
      
      {/* Overlay info */}
      <div className="absolute bottom-4 left-4 rounded-md bg-card/80 backdrop-blur-sm border border-border px-3 py-2">
        <p className="text-xs text-muted-foreground">
          Drag to rotate | Scroll to zoom | Right-click to pan
        </p>
      </div>
    </div>
  )
}
