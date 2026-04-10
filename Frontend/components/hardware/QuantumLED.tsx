'use client'

import { useEffect, useRef } from 'react'

interface QuantumLEDProps {
  alpha: number
  beta: number
  measured?: boolean
  size?: number
}

/**
 * Quantum LED — a glowing RGB circle driven by qubit state (alpha, beta).
 *
 * Color mapping:
 *   alpha → blue channel  (|0⟩ state)
 *   beta  → green channel (|1⟩ state)
 *
 * When fully |0⟩: pure deep blue
 * When fully |1⟩: pure neon green
 * In superposition: cyan/teal blend
 * When measured: solid saturated color, no pulse
 */
export function QuantumLED({ alpha, beta, measured = false, size = 48 }: QuantumLEDProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Clamp to [0,1]
  const a = Math.min(1, Math.max(0, Math.abs(alpha)))
  const b = Math.min(1, Math.max(0, Math.abs(beta)))

  // Derived color
  const r = Math.round(b * 30)                          // slight red tint on |1⟩
  const g = Math.round(b * 255)                         // green for |1⟩
  const bl = Math.round(a * 220 + b * 80)               // blue: high for |0⟩, partial for superposition

  const color = `rgb(${r}, ${g}, ${bl})`
  const glowColor = `rgba(${r}, ${g}, ${bl}, 0.55)`
  const glowStrong = `rgba(${r}, ${g}, ${bl}, 0.25)`

  const purity = Math.abs(a * a - b * b)               // 1 = pure state, 0 = max superposition
  const glowRadius = measured ? size * 0.6 : size * (0.6 + (1 - purity) * 0.5)
  const pulseClass = !measured && purity < 0.9 ? 'animate-pulse' : ''

  const label = measured
    ? a > b ? '|0⟩' : '|1⟩'
    : purity < 0.1
    ? '|+⟩'
    : a > b
    ? `|0⟩ ${Math.round(a * a * 100)}%`
    : `|1⟩ ${Math.round(b * b * 100)}%`

  return (
    <div className="flex flex-col items-center gap-2">
      {/* LED Circle */}
      <div
        className={`relative rounded-full transition-all duration-150 ${pulseClass}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          boxShadow: [
            `0 0 ${glowRadius * 0.5}px ${glowColor}`,
            `0 0 ${glowRadius}px ${glowStrong}`,
            measured ? '' : `0 0 ${glowRadius * 1.5}px rgba(${r},${g},${bl},0.12)`,
          ]
            .filter(Boolean)
            .join(', '),
        }}
      >
        {/* Inner specular */}
        <div
          className="absolute rounded-full opacity-30"
          style={{
            top: size * 0.12,
            left: size * 0.2,
            width: size * 0.35,
            height: size * 0.22,
            backgroundColor: `rgba(255,255,255,0.8)`,
          }}
        />

        {/* Superposition shimmer ring */}
        {!measured && purity < 0.85 && (
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: `1px solid rgba(${r},${g},${bl},0.4)`,
              animationDuration: '3s',
            }}
          />
        )}
      </div>

      {/* State label */}
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
