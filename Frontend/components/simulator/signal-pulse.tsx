'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SignalPulseProps {
  startPosition: [number, number, number]
  endPosition: [number, number, number]
  signalValue: number
  speed?: number
  showPulse?: boolean
}

export function SignalPulse({ 
  startPosition, 
  endPosition, 
  signalValue, 
  speed = 2,
  showPulse = true
}: SignalPulseProps) {
  // Generate curve path for the wire
  const { points, curve } = useMemo(() => {
    const midY = (startPosition[1] + endPosition[1]) / 2
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...startPosition),
      new THREE.Vector3(startPosition[0] + 0.3, midY, startPosition[2]),
      new THREE.Vector3(endPosition[0] - 0.3, midY, endPosition[2]),
      new THREE.Vector3(...endPosition),
    ])
    return { points: pathCurve.getPoints(50), curve: pathCurve }
  }, [startPosition, endPosition])

  const pulseRef = useRef<THREE.Mesh>(null)
  const lineMaterialRef = useRef<THREE.LineBasicMaterial>(null)
  const progressRef = useRef(0)

  const isActive = signalValue === 1
  const targetColor = isActive ? new THREE.Color('#22c55e') : new THREE.Color('#1e3a8a')
  // We want logic 0 to be dim blue, logic 1 neon green

  useFrame((_, delta) => {
    // Animate signal traversing the wire
    if (pulseRef.current && showPulse && isActive) {
      progressRef.current += delta * speed
      if (progressRef.current > 1) progressRef.current = 0
      
      const point = curve.getPointAt(progressRef.current)
      pulseRef.current.position.set(point.x, point.y, point.z)
    }

    // Smooth color transition for wire
    if (lineMaterialRef.current) {
      lineMaterialRef.current.color.lerp(targetColor, delta * 5)
      lineMaterialRef.current.opacity = THREE.MathUtils.lerp(
        lineMaterialRef.current.opacity, 
        isActive ? 1 : 0.3, 
        delta * 5
      )
    }
  })

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 50, 0.03, 8, false)
  }, [curve])

  return (
    <group>
      {/* 3D Wire Path */}
      <mesh geometry={geometry}>
        <meshStandardMaterial 
          ref={lineMaterialRef as any}
          color={targetColor} 
          emissive={targetColor}
          emissiveIntensity={isActive ? 0.8 : 0.1}
          transparent
          opacity={isActive ? 1 : 0.3}
        />
      </mesh>

      {/* Moving Signal Particle with Glow */}
      {showPulse && isActive && (
        <group ref={pulseRef as any}>
          {/* Core particle */}
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#a3e635"
              emissive="#a3e635"
              emissiveIntensity={4}
            />
          </mesh>
          {/* Outer glow sphere */}
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial
              color="#a3e635"
              transparent
              opacity={0.3}
            />
          </mesh>
          {/* Subtle PointLight for environmental glow */}
          <pointLight color="#a3e635" intensity={0.5} distance={1} />
        </group>
      )}
    </group>
  )
}
