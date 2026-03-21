'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation-store'

function FlipFlopModule({ 
  position, 
  index, 
  state, 
  circuitType 
}: { 
  position: [number, number, number]
  index: number
  state: { q: number; qBar: number; d?: number }
  circuitType: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  
  const isActive = state.q === 1
  const color = isActive ? '#22c55e' : '#1e3a5f'
  const emissiveIntensity = isActive ? 0.6 : 0.1
  
  useFrame((_, delta) => {
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group position={position}>
      {/* Main module body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.2, 0.4]} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      {/* Edge glow */}
      <mesh ref={glowRef} scale={[1.85, 1.25, 0.45]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={isActive ? '#22c55e' : '#3b82f6'}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0.3, 0.25]}
        fontSize={0.18}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter.woff"
      >
        {circuitType.includes('JK') ? 'JK' : circuitType.includes('T') ? 'T' : 'D'} FF{index + 1}
      </Text>

      {/* Input labels */}
      <Text
        position={[-0.7, 0, 0.25]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="center"
      >
        {circuitType.includes('JK') ? 'J/K' : circuitType.includes('T') ? 'T' : 'D'}
      </Text>

      <Text
        position={[-0.7, -0.35, 0.25]}
        fontSize={0.12}
        color="#f97316"
        anchorX="center"
      >
        CLK
      </Text>

      {/* Output labels */}
      <Text
        position={[0.7, 0.15, 0.25]}
        fontSize={0.12}
        color={isActive ? '#22c55e' : '#64748b'}
        anchorX="center"
      >
        Q={state.q}
      </Text>

      <Text
        position={[0.7, -0.2, 0.25]}
        fontSize={0.1}
        color="#64748b"
        anchorX="center"
      >
        Q̅={state.qBar}
      </Text>

      {/* Connection nodes */}
      {/* Input node */}
      <mesh position={[-1, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
      </mesh>

      {/* Clock node */}
      <mesh position={[-1, -0.35, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.5} />
      </mesh>

      {/* Output node */}
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={isActive ? '#22c55e' : '#3b82f6'} 
          emissive={isActive ? '#22c55e' : '#3b82f6'} 
          emissiveIntensity={isActive ? 0.8 : 0.3} 
        />
      </mesh>
    </group>
  )
}

function ClockGenerator({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { currentCycle } = useSimulationStore()
  
  const isHigh = currentCycle % 2 === 0
  
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += delta * 2
    }
  })

  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 32]} />
        <meshStandardMaterial
          color="#f97316"
          metalness={0.6}
          roughness={0.3}
          emissive="#f97316"
          emissiveIntensity={isHigh ? 0.8 : 0.2}
        />
      </mesh>
      
      {/* Rotating inner element */}
      <mesh ref={meshRef} position={[0, 0.2, 0]}>
        <torusGeometry args={[0.3, 0.05, 16, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#fbbf24"
          emissiveIntensity={0.6}
        />
      </mesh>

      <Text
        position={[0, -0.4, 0.2]}
        fontSize={0.15}
        color="#f97316"
        anchorX="center"
        rotation={[-Math.PI / 2, 0, 0]}
      >
        CLOCK
      </Text>
    </group>
  )
}

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

function Wire({ 
  start, 
  end, 
  isActive,
  showPulse 
}: { 
  start: [number, number, number]
  end: [number, number, number]
  isActive: boolean
  showPulse: boolean
}) {
  const points = useMemo(() => {
    const midY = (start[1] + end[1]) / 2
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...start),
      new THREE.Vector3(start[0] + 0.3, midY, start[2]),
      new THREE.Vector3(end[0] - 0.3, midY, end[2]),
      new THREE.Vector3(...end),
    ])
    return curve.getPoints(50)
  }, [start, end])

  const pulseRef = useRef<THREE.Mesh>(null)
  const progressRef = useRef(0)

  useFrame((_, delta) => {
    if (pulseRef.current && showPulse && isActive) {
      progressRef.current += delta * 2
      if (progressRef.current > 1) progressRef.current = 0
      
      const t = progressRef.current
      const pointIndex = Math.floor(t * (points.length - 1))
      const point = points[Math.min(pointIndex, points.length - 1)]
      pulseRef.current.position.set(point.x, point.y, point.z)
    }
  })

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial 
          color={isActive ? '#22c55e' : '#3b82f6'} 
          linewidth={2}
          transparent
          opacity={isActive ? 1 : 0.5}
        />
      </line>

      {/* Signal pulse */}
      {showPulse && isActive && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={1}
            transparent
            opacity={0.9}
          />
        </mesh>
      )}
    </group>
  )
}

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
        <ClockGenerator position={[startX - 3, 0, 0]} />
      </Float>

      {/* Input source */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <InputSource position={[startX - 1.5, 0.8, 0]} />
      </Float>

      {/* Wire from input to first flip-flop */}
      <Wire
        start={[startX - 1, 0.8, 0]}
        end={[startX - 1, 0, 0]}
        isActive={currentBit === 1}
        showPulse={showSignalFlow}
      />

      {/* Flip-flops */}
      {flipFlops.map((ff, i) => (
        <Float key={ff.id} speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
          <FlipFlopModule
            position={[startX + i * flipFlopSpacing, 0, 0]}
            index={i}
            state={ff}
            circuitType={circuitType}
          />
        </Float>
      ))}

      {/* Wires between flip-flops */}
      {flipFlops.slice(0, -1).map((ff, i) => (
        <Wire
          key={`wire-${i}`}
          start={[startX + i * flipFlopSpacing + 1, 0, 0]}
          end={[startX + (i + 1) * flipFlopSpacing - 1, 0, 0]}
          isActive={ff.q === 1}
          showPulse={showSignalFlow}
        />
      ))}

      {/* Clock lines to all flip-flops */}
      {flipFlops.map((_, i) => (
        <Wire
          key={`clock-${i}`}
          start={[startX - 3, -0.3, 0]}
          end={[startX + i * flipFlopSpacing - 1, -0.35, 0]}
          isActive={currentCycle % 2 === 0}
          showPulse={showSignalFlow}
        />
      ))}

      {/* Ring/Johnson counter feedback wire */}
      {(circuitType === 'Ring Counter' || circuitType === 'Johnson Counter') && flipFlops.length > 1 && (
        <Wire
          start={[startX + (flipFlops.length - 1) * flipFlopSpacing + 1, 0, 0]}
          end={[startX - 1, 0, 0]}
          isActive={flipFlops[flipFlops.length - 1].q === (circuitType === 'Johnson Counter' ? 0 : 1)}
          showPulse={showSignalFlow}
        />
      )}

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
      <Canvas
        shadows
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{ antialias: true }}
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
