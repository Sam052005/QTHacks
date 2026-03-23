'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface FlipFlopState {
  q: number
  qBar: number
}

interface FlipFlopBlockProps {
  position: [number, number, number]
  index: number
  state: FlipFlopState
  circuitType: string
}

export function FlipFlopBlock({ 
  position, 
  index, 
  state, 
  circuitType 
}: FlipFlopBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const highlightGlowRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const connectionMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  
  const [justUpdated, setJustUpdated] = useState(false)
  const prevQ = useRef(state.q)

  useEffect(() => {
    if (state.q !== prevQ.current) {
      setJustUpdated(true)
      const timer = setTimeout(() => setJustUpdated(false), 500)
      prevQ.current = state.q
      return () => clearTimeout(timer)
    }
  }, [state.q])

  const isActive = state.q === 1
  const targetColor = isActive ? new THREE.Color('#22c55e') : new THREE.Color('#1e3a5f')
  const targetEmissive = isActive ? 0.8 : 0.1

  useFrame((_, delta) => {
    // Subtle rotation for hover effect
    if (meshRef.current) {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        isActive ? 0.1 : 0, 
        delta * 3
      )
    }

    // Material smooth transitions
    if (materialRef.current) {
      materialRef.current.color.lerp(targetColor, delta * 5)
      materialRef.current.emissive.lerp(targetColor, delta * 5)
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        materialRef.current.emissiveIntensity,
        targetEmissive,
        delta * 5
      )
    }

    // Highlight glow on state change
    if (highlightGlowRef.current) {
      const targetScale = justUpdated ? 1.3 : 1.05
      const currentScale = highlightGlowRef.current.scale.x
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 8)
      highlightGlowRef.current.scale.set(nextScale, nextScale, nextScale)
      
      const mat = highlightGlowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = THREE.MathUtils.lerp(
        mat.opacity, 
        justUpdated ? 0.6 : (isActive ? 0.15 : 0.0), 
        delta * 5
      )
    }
    
    // Output connection point brightness
    if(connectionMaterialRef.current) {
        connectionMaterialRef.current.color.lerp(isActive ? new THREE.Color('#4ade80') : new THREE.Color('#1e3a8a'), delta * 5)
        connectionMaterialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
            connectionMaterialRef.current.emissiveIntensity,
            isActive ? 1.5 : 0.2,
            delta * 5
        )
    }
  })

  const labelPrefix = circuitType.includes('JK') ? 'JK' : circuitType.includes('T') ? 'T' : 'D'
  const inputLabel = circuitType.includes('JK') ? 'J/K' : circuitType.includes('T') ? 'T' : 'D'

  return (
    <group position={position}>
      {/* Main Block Body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.4, 0.4]} />
        <meshStandardMaterial
          ref={materialRef}
          color={targetColor}
          metalness={0.7}
          roughness={0.2}
          emissive={targetColor}
          emissiveIntensity={targetEmissive}
        />
      </mesh>

      {/* Aura / Highlight Glow */}
      <mesh ref={highlightGlowRef}>
        <boxGeometry args={[1.9, 1.5, 0.5]} />
        <meshBasicMaterial
          color={isActive ? '#4ade80' : '#60a5fa'}
          transparent
          opacity={0.0}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Hardware Text Labeling */}
      <Text position={[0, 0.4, 0.25]} fontSize={0.18} color="#ffffff" anchorX="center" anchorY="middle" font="/fonts/inter.woff">
        {labelPrefix} FF{index + 1}
      </Text>

      {/* Input pins annotation */}
      <Text position={[-0.7, 0.1, 0.25]} fontSize={0.12} color="#cbd5e1" anchorX="center">
        {inputLabel}
      </Text>
      <Text position={[-0.7, -0.35, 0.25]} fontSize={0.12} color="#fb923c" anchorX="center">
        CLK
      </Text>

      {/* Output pins annotation */}
      <Text position={[0.7, 0.15, 0.25]} fontSize={0.14} color={isActive ? '#ffffff' : '#94a3b8'} anchorX="center" fontWeight={isActive ? "bold" : "normal"}>
        Q={state.q}
      </Text>
      <Text position={[0.7, -0.2, 0.25]} fontSize={0.1} color="#64748b" anchorX="center">
        Q̅={state.qBar}
      </Text>

      {/* Physical nodes */}
      <mesh position={[-1, 0.1, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[-1, -0.35, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={0.8} />
      </mesh>

      <mesh position={[1, 0.15, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial ref={connectionMaterialRef} color={isActive ? '#4ade80' : '#1e3a8a'} emissive={isActive ? '#4ade80' : '#1e3a8a'} emissiveIntensity={isActive ? 1.5 : 0.2} />
      </mesh>
    </group>
  )
}
