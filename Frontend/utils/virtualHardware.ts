/**
 * Virtual Hardware Layer
 * Simulates the behavior of a physical ESP32 Logic Trainer Board entirely in software.
 * All responses are delayed by 150ms to mimic real serial round-trip timing.
 *
 * Future: swap sendToHardware() → serialManager.send() for real hardware with zero other changes.
 */

export interface HardwarePayload {
  type: 'STATE_UPDATE' | 'CLOCK_PULSE' | 'QUANTUM_UPDATE' | 'MEASURE'
  states?: number[]
  inputs?: number[]
  alpha?: number
  beta?: number
}

export interface HardwareResponse {
  type: 'STATE_UPDATE' | 'QUANTUM_RESPONSE' | 'MEASURE_RESULT'
  states: number[]
  alpha?: number
  beta?: number
  measureResult?: 0 | 1
  timestamp: number
}

const HARDWARE_DELAY_MS = 150

/**
 * Simulate the hardware's internal processing and response.
 */
function simulateHardwareResponse(data: HardwarePayload): Promise<HardwareResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (data.type === 'QUANTUM_UPDATE' && data.alpha !== undefined && data.beta !== undefined) {
        resolve({
          type: 'QUANTUM_RESPONSE',
          states: [],
          alpha: data.alpha,
          beta: data.beta,
          timestamp: Date.now(),
        })
        return
      }

      if (data.type === 'MEASURE' && data.alpha !== undefined) {
        const prob0 = data.alpha * data.alpha
        const result: 0 | 1 = Math.random() < prob0 ? 0 : 1
        resolve({
          type: 'MEASURE_RESULT',
          states: [result],
          measureResult: result,
          timestamp: Date.now(),
        })
        return
      }

      // Default: echo the given states back as a STATE_UPDATE
      resolve({
        type: 'STATE_UPDATE',
        states: data.states || data.inputs || [],
        timestamp: Date.now(),
      })
    }, HARDWARE_DELAY_MS)
  })
}

/**
 * Primary entry point. Send data to the virtual hardware layer.
 */
export async function sendToVirtualHardware(data: HardwarePayload): Promise<HardwareResponse> {
  console.log('[VirtualHW] Received:', data)
  const response = await simulateHardwareResponse(data)
  console.log('[VirtualHW] Responding:', response)
  return response
}
