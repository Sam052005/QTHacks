'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation-store'

function BlochVector({ alpha, beta }: { alpha: number; beta: number }) {
  const arrowRef = useRef<THREE.Mesh>(null)
  const targetRef = useRef(new THREE.Vector3(0, 1, 0))

  // Convert alpha/beta to Bloch sphere angles
  // |ψ⟩ = α|0⟩ + β|1⟩ → θ = 2*acos(|α|), φ = arg(β/α)
  const theta = 2 * Math.acos(Math.min(1, Math.abs(alpha)))
  const phi = beta < 0 ? Math.PI : 0
  const x = Math.sin(theta) * Math.cos(phi)
  const y = Math.cos(theta)
  const z = Math.sin(theta) * Math.sin(phi)
  targetRef.current.set(x, y, z)

  useFrame((_, delta) => {
    if (!arrowRef.current) return
    arrowRef.current.position.lerp(
      new THREE.Vector3(x * 0.5, y * 0.5, z * 0.5),
      delta * 4
    )
    // Rotate to point along vector
    arrowRef.current.lookAt(targetRef.current)
  })

  const isSuper = Math.abs(alpha) < 0.99 && Math.abs(beta) < 0.99
  const color = isSuper ? '#a855f7' : alpha > 0.5 ? '#3b82f6' : '#22c55e'

  return (
    <group>
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
    </group>
  )
}

function BlochScene() {
  const { qubitAlpha, qubitBeta } = useSimulationStore()

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} intensity={0.8} />

      {/* Main sphere - transparent glass */}
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

      <OrbitControls enablePan={false} minDistance={2.5} maxDistance={5} />
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
