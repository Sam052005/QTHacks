/**
 * Hardware Interface Router
 * Mode-aware abstraction layer that routes all hardware calls to the correct implementation.
 *
 * "simulation" → no hardware layer; state updates are instant (existing behavior)
 * "virtual"    → routes to virtualHardware.ts (150ms simulated delay)
 * "real"       → routes to serial.ts (physical ESP32 over Web Serial API)
 *
 * This file is the ONLY place that knows which mode is active.
 * All UI components call send() without caring about the underlying transport.
 */

import { sendToVirtualHardware, type HardwarePayload, type HardwareResponse } from './virtualHardware'

export type HardwareLayerMode = 'simulation' | 'virtual' | 'real'

let _currentMode: HardwareLayerMode = 'simulation'

export function setHardwareLayerMode(mode: HardwareLayerMode) {
  _currentMode = mode
  console.log(`[HardwareInterface] Mode → ${mode}`)
}

export function getHardwareLayerMode(): HardwareLayerMode {
  return _currentMode
}

/**
 * Unified send function. Call this from any component.
 */
export async function send(data: HardwarePayload): Promise<HardwareResponse | null> {
  switch (_currentMode) {
    case 'simulation':
      // Pure software mode — no hardware layer involved
      return null

    case 'virtual':
      return sendToVirtualHardware(data)

    case 'real': {
      // Route to the existing Web Serial implementation
      try {
        const { serialManager } = await import('./serial')
        await serialManager.send(data)
        // Physical hardware responds asynchronously via the serialManager callbacks;
        // return null here — the store will be updated via onMessage callback.
        return null
      } catch (err) {
        console.error('[HardwareInterface] Real hardware send failed:', err)
        return null
      }
    }

    default:
      return null
  }
}
