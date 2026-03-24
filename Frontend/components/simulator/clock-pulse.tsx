'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/lib/simulation-store'

interface ClockPulseProps {
  position: [number, number, number]
}

export function ClockPulse({ position }: ClockPulseProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  
  const { currentCycle, clockFrequency } = useSimulationStore()
  const isHigh = currentCycle % 2 === 0
  
  useFrame((_, delta) => {
    // Make the outer ring rotate smoothly based on frequency
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * clockFrequency
    }

    // Pulse scaling effect for the clock core
    if (meshRef.current && materialRef.current) {
      const targetScale = isHigh ? 1.2 : 1.0
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 10)
      
      const targetIntensity = isHigh ? 2.0 : 0.3
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        materialRef.current.emissiveIntensity,
        targetIntensity,
        delta * 10
      )
    }
  })

  return (
    <group position={position}>
      {/* Clock body */}
      <RoundedBox ref={meshRef} args={[0.8, 0.4, 0.8]} radius={0.05} castShadow>
        <meshPhysicalMaterial
          ref={materialRef}
          color="#f97316"
          metalness={0.9}
          roughness={0.1}
          emissive="#fb923c"
          emissiveIntensity={isHigh ? 2.5 : 0.2}
          transmission={0.2}
          thickness={1}
        />
      </RoundedBox>
      
      {/* Rotating outer ring */}
      <mesh ref={ringRef} position={[0, 0.2, 0]}>
        <torusGeometry args={[0.65, 0.05, 16, 64]} />
        <meshStandardMaterial
          color={isHigh ? "#fbbf24" : "#b45309"}
          emissive={isHigh ? "#fbbf24" : "#000000"}
          emissiveIntensity={isHigh ? 1 : 0}
        />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.2}
        color="#f97316"
        anchorX="center"
        anchorY="top"
        fontWeight="bold"
      >
        CLK
      </Text>
    </group>
  )
}
