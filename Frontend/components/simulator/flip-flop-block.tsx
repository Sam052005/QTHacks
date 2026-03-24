'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox, Float } from '@react-three/drei'
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
  showPropagationDelay?: boolean
}

export function FlipFlopBlock({ 
  position, 
  index, 
  state, 
  circuitType,
  showPropagationDelay = true
}: FlipFlopBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const highlightGlowRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const connectionMaterialRef = useRef<THREE.MeshStandardMaterial>(null)
  
  const [justUpdated, setJustUpdated] = useState(false)
  const [displayQ, setDisplayQ] = useState(state.q)
  const prevQ = useRef(state.q)

  useEffect(() => {
    if (state.q !== prevQ.current) {
      const delay = showPropagationDelay ? 300 : 0
      
      const timer = setTimeout(() => {
        setDisplayQ(state.q)
        setJustUpdated(true)
        setTimeout(() => setJustUpdated(false), 500)
      }, delay)
      
      prevQ.current = state.q
      return () => clearTimeout(timer)
    }
  }, [state.q, showPropagationDelay])

  const isActive = displayQ === 1
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
      <Float speed={2} rotationIntensity={0.05} floatIntensity={0.2}>
        {/* Main Glass Shell */}
        <RoundedBox 
          ref={meshRef} 
          args={[1.8, 1.4, 0.4]} 
          radius={0.08} 
          smoothness={4} 
          castShadow 
          receiveShadow
        >
          <meshPhysicalMaterial
            ref={materialRef}
            color={isActive ? '#10b981' : '#1e293b'}
            metalness={0.1}
            roughness={0.1}
            transmission={0.6}
            thickness={0.5}
            envMapIntensity={1}
            emissive={targetColor}
            emissiveIntensity={targetEmissive}
          />
        </RoundedBox>

        {/* Interior Core Logic Block */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[1.5, 1.1, 0.2]} />
          <meshStandardMaterial 
            color="#0f172a" 
            metalness={0.8} 
            roughness={0.2} 
          />
        </mesh>

        {/* Aura / Highlight Glow (Internal) */}
        <mesh ref={highlightGlowRef} position={[0, 0, -0.1]}>
          <boxGeometry args={[1.6, 1.2, 0.1]} />
          <meshBasicMaterial
            color={isActive ? '#4ade80' : '#3b82f6'}
            transparent
            opacity={0.05}
          />
        </mesh>

        {/* State LED - Q */}
        <mesh position={[0.6, 0.4, 0.22]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color={isActive ? "#4ade80" : "#1e293b"}
            emissive={isActive ? "#4ade80" : "#000000"}
            emissiveIntensity={isActive ? 5 : 0}
          />
          {isActive && <pointLight distance={1} intensity={1} color="#4ade80" />}
        </mesh>

        {/* State LED - QBar */}
        <mesh position={[0.6, -0.4, 0.22]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color={!isActive ? "#ef4444" : "#1e293b"}
            emissive={!isActive ? "#ef4444" : "#000000"}
            emissiveIntensity={!isActive ? 3 : 0}
          />
        </mesh>

        {/* Hardware Text Labeling */}
        <Text 
          position={[-0.4, 0.4, 0.22]} 
          fontSize={0.18} 
          color="#f8fafc" 
          anchorX="left" 
          anchorY="middle"
          fontWeight="bold"
        >
          {labelPrefix} FF{index + 1}
        </Text>

        {/* Dynamic State Info */}
        <group position={[0,0,0.22]}>
          <Text position={[-0.7, 0.1, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
            {inputLabel}
          </Text>
          <Text position={[-0.7, -0.35, 0]} fontSize={0.12} color="#f97316" anchorX="center">
            CLK
          </Text>
          
          <Text position={[0.6, 0.15, 0]} fontSize={0.12} color={isActive ? "#4ade80" : "#64748b"} anchorX="right">
            Q
          </Text>
          <Text position={[0.6, -0.15, 0]} fontSize={0.12} color={!isActive ? "#ef4444" : "#64748b"} anchorX="right">
            Q̅
          </Text>
        </group>

        {/* Connection Terminal Pins */}
        <mesh position={[-0.95, 0.1, 0]} rotation={[0, Math.PI/2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[-0.95, -0.35, 0]} rotation={[0, Math.PI/2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial color="#f97316" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.95, 0.15, 0]} rotation={[0, Math.PI/2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          <meshStandardMaterial ref={connectionMaterialRef} color={isActive ? '#4ade80' : '#1e3a8a'} metalness={0.9} />
        </mesh>
      </Float>
    </group>
  )
}
