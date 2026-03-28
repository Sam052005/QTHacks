'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation-store'
import { motion, AnimatePresence } from 'framer-motion'

function BlochVector({ alpha, beta }: { alpha: number; beta: number }) {
  const arrowRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const targetRef = useRef(new THREE.Vector3(0, 1, 0))
  const { activeGatePulse } = useSimulationStore()

  // Convert alpha/beta to Bloch sphere angles
  // |ψ⟩ = α|0⟩ + β|1⟩ → θ = 2*acos(|α|), φ = arg(β/α)
  const theta = 2 * Math.acos(Math.min(1, Math.abs(alpha)))
  const phi = beta < 0 ? Math.PI : 0
  const x = Math.sin(theta) * Math.cos(phi)
  const y = Math.cos(theta)
  const z = Math.sin(theta) * Math.sin(phi)
  targetRef.current.set(x, y, z)

  useFrame((state, delta) => {
    if (!arrowRef.current || !groupRef.current) return
    
    // Pulse animation on gate apply
    const pulseScale = activeGatePulse ? 1.15 : 1.0
    groupRef.current.scale.lerp(new THREE.Vector3(pulseScale, pulseScale, pulseScale), delta * 15)

    // Add Noise/Jitter
    const noise = useSimulationStore.getState().quantumNoise
    const jitterX = (Math.random() - 0.5) * noise * 0.2
    const jitterY = (Math.random() - 0.5) * noise * 0.2
    const jitterZ = (Math.random() - 0.5) * noise * 0.2

    arrowRef.current.position.lerp(
      new THREE.Vector3(x * 0.5 + jitterX, y * 0.5 + jitterY, z * 0.5 + jitterZ),
      delta * 4
    )
    arrowRef.current.lookAt(new THREE.Vector3(x + jitterX, y + jitterY, z + jitterZ))
  })

  const isSuper = Math.abs(alpha) < 0.99 && Math.abs(beta) < 0.99
  const color = isSuper ? '#a855f7' : alpha > 0.5 ? '#3b82f6' : '#22c55e'

  return (
    <group ref={groupRef}>
      {/* Arrow shaft */}
      <mesh ref={arrowRef} position={[x * 0.5, y * 0.5, z * 0.5]}>
        <cylinderGeometry args={[0.025, 0.025, 1.0, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
      {/* Arrow head */}
      <mesh position={[x, y, z]}>
        <coneGeometry args={[0.07, 0.2, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      {/* Glow at tip */}
      <pointLight position={[x, y, z]} color={color} intensity={2} distance={1.5} />
      
      {/* Bra-Ket Math Overlay */}
      <Html position={[x * 1.2, y * 1.2, z * 1.2]} center>
        <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-primary/30 shadow-2xl pointer-events-none whitespace-nowrap">
          <p className="text-[10px] font-mono leading-tight">
            <span className="text-purple-400">|ψ⟩</span> = 
            <span className="text-blue-400"> {alpha.toFixed(2)}</span>|0⟩ + 
            <span className="text-green-400"> {beta.toFixed(2)}</span>|1⟩
          </p>
        </div>
      </Html>
    </group>
  )
}

function StateTrajectory() {
  const { qubitHistory } = useSimulationStore()
  if (qubitHistory.length < 2) return null
  const points = qubitHistory.map(h => {
    const theta = 2 * Math.acos(Math.min(1, Math.abs(h.alpha)))
    const phi = h.beta < 0 ? Math.PI : 0
    return new THREE.Vector3(Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi))
  })
  return (
    <line>
      <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints(points)} />
      <lineBasicMaterial attach="material" color="#a855f7" transparent opacity={0.4} />
    </line>
  )
}

function PhaseRing({ alpha }: { alpha: number }) {
  const theta = 2 * Math.acos(Math.min(1, Math.abs(alpha)))
  const radius = Math.sin(theta)
  const y = Math.cos(theta)
  if (radius < 0.05) return null
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.002, 8, 64]} />
      <meshBasicMaterial color="#a855f7" transparent opacity={0.3} />
    </mesh>
  )
}

function DensityMatrixUI() {
  const { qubitAlpha: a, qubitBeta: b } = useSimulationStore()
  const r00 = (a * a).toFixed(2), r11 = (b * b).toFixed(2), r01 = (a * b * 0.5).toFixed(2)
  return (
    <Html position={[1.8, -0.5, 0]}>
      <div className="bg-black/80 backdrop-blur-xl p-3 rounded-xl border border-white/10 shadow-2xl min-w-[140px]">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2 tracking-widest text-center">Density Matrix ρ</h4>
        <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-center">
          <div className="p-1.5 bg-blue-500/10 rounded tracking-tighter">{r00}</div>
          <div className="p-1.5 bg-purple-500/10 rounded tracking-tighter">{r01}</div>
          <div className="p-1.5 bg-purple-500/10 rounded tracking-tighter">{r01}</div>
          <div className="p-1.5 bg-green-500/10 rounded tracking-tighter">{r11}</div>
        </div>
      </div>
    </Html>
  )
}

function QuantumAura() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { qubitAlpha, qubitBeta } = useSimulationStore()
  const isSuper = Math.abs(qubitAlpha) < 0.99 && Math.abs(qubitBeta) < 0.99

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const s = 1.05 + Math.sin(t * 3) * 0.02
    meshRef.current.scale.set(s, s, s)
  })

  if (!isSuper) return null

  return (
    <Sphere ref={meshRef} args={[1.05, 32, 32]}>
      <meshStandardMaterial 
        color="#a855f7" 
        transparent 
        opacity={0.15} 
        emissive="#a855f7"
        emissiveIntensity={1.5}
        side={THREE.DoubleSide}
      />
    </Sphere>
  )
}

function BlochScene() {
  const { qubitAlpha, qubitBeta, isMeasured, isEntangled, qubit2Alpha, qubit2Beta } = useSimulationStore()

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={0.8} />
      
      {/* Measurement Flash */}
      <AnimatePresence>
        {isMeasured && (
          <pointLight position={[0, 0, 0]} color="#fff" intensity={15} distance={10} />
        )}
      </AnimatePresence>

      {/* Main sphere - transparent glass */}
      <QuantumAura />
      <StateTrajectory />
      <PhaseRing alpha={qubitAlpha} />
      <DensityMatrixUI />
      <Sphere args={[1, 48, 48]}>
        <meshPhysicalMaterial
          color="#1e293b"
          metalness={0.0}
          roughness={0.0}
          transmission={0.7}
          thickness={0.5}
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[1.01, 16, 16]}>
        <meshBasicMaterial color="#334155" wireframe transparent opacity={0.2} />
      </Sphere>

      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1, 0.005, 12, 80]} />
        <meshBasicMaterial color="#475569" />
      </mesh>

      {/* Meridian rings */}
      <mesh>
        <torusGeometry args={[1, 0.005, 12, 80]} />
        <meshBasicMaterial color="#475569" />
      </mesh>
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1, 0.005, 12, 80]} />
        <meshBasicMaterial color="#475569" />
      </mesh>

      {/* Axis labels positions — small glowing dots */}
      {/* |0⟩ north pole */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={3} />
      </mesh>
      {/* |1⟩ south pole */}
      <mesh position={[0, -1.1, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={3} />
      </mesh>

      {/* State vector */}
      <BlochVector alpha={qubitAlpha} beta={qubitBeta} />

      {/* Entanglement Tether */}
      {isEntangled && (
        <group position={[2.5, 0, 0]}>
          <BlochVector alpha={qubit2Alpha} beta={qubit2Beta} />
          {/* Main sphere for Qubit 2 */}
          <Sphere args={[1, 32, 32]}>
            <meshPhysicalMaterial color="#1e293b" transparent opacity={0.2} transmission={0.5} thickness={0.5} />
          </Sphere>
          {/* Tether Beam */}
          <mesh position={[-1.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 1.5, 8]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={8} />
    </>
  )
}

export function BlochSphere() {
  const { qubitAlpha, qubitBeta } = useSimulationStore()
  const prob0 = (qubitAlpha * qubitAlpha * 100).toFixed(1)
  const prob1 = (qubitBeta * qubitBeta * 100).toFixed(1)
  const isSuper = Math.abs(qubitAlpha) < 0.99 && Math.abs(qubitBeta) < 0.99

  return (
    <div className="flex flex-col h-full w-full">
      {/* 3D Sphere */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [2, 1.5, 2.5], fov: 45 }}>
          <BlochScene />
        </Canvas>

        {/* Pole labels overlay */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-400">|0⟩</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-green-400">|1⟩</div>
        {isSuper && (
          <div className="absolute top-1/2 right-4 -translate-y-1/2 text-[10px] text-purple-400 font-bold animate-pulse">
            SUPERPOSITION
          </div>
        )}
      </div>

      {/* Probability bars */}
      <div className="px-4 pb-4 space-y-2">
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span className="font-mono text-blue-400">|α|² = P(|0⟩)</span>
            <span className="font-mono">{prob0}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${prob0}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span className="font-mono text-green-400">|β|² = P(|1⟩)</span>
            <span className="font-mono">{prob1}%</span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${prob1}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
