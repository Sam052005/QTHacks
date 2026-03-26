import { create } from 'zustand'

export type CircuitType = 
  | 'D Flip-Flop' 
  | 'JK Flip-Flop' 
  | 'T Flip-Flop' 
  | 'Shift Register' 
  | 'Ring Counter' 
  | 'Johnson Counter'

export interface FlipFlopState {
  id: number
  q: number
  qBar: number
  d?: number
  j?: number
  k?: number
  t?: number
}

export interface TimingPoint {
  time: number
  clock: number
  input: number
  outputs: number[]
}

export interface SimulationState {
  // Circuit configuration
  circuitType: CircuitType
  numFlipFlops: number
  clockFrequency: number
  simulationCycles: number
  inputBitSequence: string
  
  // Simulation state
  isRunning: boolean
  isPaused: boolean
  currentCycle: number
  flipFlops: FlipFlopState[]
  timingData: TimingPoint[]
  
  // Feature toggles
  showPropagationDelay: boolean
  showSignalFlow: boolean
  autoDetectCircuit: boolean
  
  // View mode
  viewMode: 'simulator' | 'builder'
  tabActive: 'Simulation' | 'Builder' | 'Library' | 'Analysis' | 'Challenges'
  detectedCircuit: string | null
  
  // Signal animation
  activeSignals: { from: string; to: string; progress: number }[]
  
  // Phase 1: Foundations
  selectedComponent: string | null
  changedComponents: Set<string>
  
  // Phase 3: Propagation delay & exports
  delayMs: number
  liveUpdate: boolean
  
  // Phase 8: Backend connection
  simulationId: string | null
  projectId: string | null
  backendTimingData: any[]
  
  // Actions
  setCircuitType: (type: CircuitType) => void
  setNumFlipFlops: (num: number) => void
  setClockFrequency: (freq: number) => void
  setSimulationCycles: (cycles: number) => void
  setInputBitSequence: (seq: string) => void
  togglePropagationDelay: () => void
  toggleSignalFlow: () => void
  toggleAutoDetect: () => void
  setViewMode: (mode: 'simulator' | 'builder') => void
  setTabActive: (tab: 'Simulation' | 'Builder' | 'Library' | 'Analysis' | 'Challenges') => void
  startSimulation: () => void
  pauseSimulation: () => void
  stepClock: () => void
  resetSimulation: () => void
  updateFlipFlops: (states: FlipFlopState[]) => void
  addTimingPoint: (point: TimingPoint) => void
  setDetectedCircuit: (circuit: string | null) => void
  addActiveSignal: (signal: { from: string; to: string; progress: number }) => void
  clearActiveSignals: () => void
  setSelectedComponent: (component: string | null) => void
  addChangedComponent: (component: string) => void
  clearChangedComponents: () => void
  setDelayMs: (delay: number) => void
  setLiveUpdate: (live: boolean) => void
  setProjectId: (id: string | null) => void
  togglePause: () => void
  stopSimulation: () => void
  _intervalId?: NodeJS.Timeout | null

  // Feature: Quantum Mode
  quantumMode: boolean
  qubitAlpha: number
  qubitBeta: number
  toggleQuantumMode: () => void
  applyHadamard: () => void
  applyPauliX: () => void
  measureQubit: () => number
  resetQubit: () => void

  // Feature: Glitch Simulation
  glitchMode: boolean
  setGlitchMode: (enabled: boolean) => void

  // Feature: Hardware Integration
  hardwareConnected: boolean
  hardwareMode: boolean
  setHardwareConnected: (connected: boolean) => void
  setHardwareMode: (mode: boolean) => void
  receiveHardwareState: (states: number[]) => void
}

const initialFlipFlops = (count: number): FlipFlopState[] => 
  Array.from({ length: count }, (_, i) => ({
    id: i,
    q: 0,
    qBar: 1,
    d: 0,
    j: 0,
    k: 0,
    t: 0,
  }))

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial state
  circuitType: 'Shift Register',
  numFlipFlops: 4,
  clockFrequency: 1,
  simulationCycles: 16,
  inputBitSequence: '10110100',
  
  isRunning: false,
  isPaused: false,
  currentCycle: 0,
  flipFlops: initialFlipFlops(4),
  timingData: [],
  
  showPropagationDelay: true,
  showSignalFlow: true,
  autoDetectCircuit: true,
  
  viewMode: 'simulator',
  tabActive: 'Simulation',
  detectedCircuit: '4-bit Shift Register',
  
  activeSignals: [],
  
  selectedComponent: null,
  changedComponents: new Set(),
  
  delayMs: 50,
  liveUpdate: true,
  
  simulationId: null,
  projectId: null,
  backendTimingData: [],

  // Quantum Mode
  quantumMode: false,
  qubitAlpha: 1,
  qubitBeta: 0,

  // Glitch Mode
  glitchMode: false,

  // Hardware Integration
  hardwareConnected: false,
  hardwareMode: false,
  
  // Actions
  setHardwareConnected: (connected) => set({ hardwareConnected: connected }),
  setHardwareMode: (mode) => set({ hardwareMode: mode }),
  receiveHardwareState: (states) => set((state) => {
    const newFlipFlops = state.flipFlops.map((ff, i) => ({
      ...ff,
      q: states[i] ?? 0,
      qBar: 1 - (states[i] ?? 0)
    }))
    return { flipFlops: newFlipFlops }
  }),

  setCircuitType: (type) => set({ circuitType: type }),
  
  setNumFlipFlops: (num) => set({ 
    numFlipFlops: num, 
    flipFlops: initialFlipFlops(num) 
  }),
  
  setClockFrequency: (freq) => {
    set({ clockFrequency: freq })
    const { isRunning, isPaused, _intervalId, startSimulation } = get()
    
    // If running, we need to restart the interval with the new frequency
    if (isRunning && _intervalId) {
      clearInterval(_intervalId)
      const interval = setInterval(() => {
        const { isRunning, isPaused, stepClock } = get()
        if (isRunning && !isPaused) {
          stepClock()
        }
      }, 1000 / freq)
      set({ _intervalId: interval })
    }
  },
  
  setSimulationCycles: (cycles) => set({ simulationCycles: cycles }),
  
  setInputBitSequence: (seq) => {
    set({ inputBitSequence: seq })
    const state = get()
    if (state.hardwareMode) {
      import('@/utils/serial').then(({ serialManager }) => {
        serialManager.send({ 
          type: 'INPUT_UPDATE', 
          inputs: seq.split('').map(Number),
          clock: 1 
        })
      })
    }
  },
  
  togglePropagationDelay: () => set((state) => ({ 
    showPropagationDelay: !state.showPropagationDelay 
  })),
  
  toggleSignalFlow: () => set((state) => ({ 
    showSignalFlow: !state.showSignalFlow 
  })),
  
  toggleAutoDetect: () => set((state) => ({ 
    autoDetectCircuit: !state.autoDetectCircuit 
  })),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setTabActive: (tab) => set({ tabActive: tab }),
  
  startSimulation: async () => {
    const state = get()
    
    // Map D Flip-Flop, etc.
    const typeMap: Record<string, string> = {
      'D Flip-Flop': 'D_FLIP_FLOP',
      'JK Flip-Flop': 'JK_FLIP_FLOP',
      'T Flip-Flop': 'T_FLIP_FLOP',
      'Shift Register': 'SHIFT_REGISTER',
      'Ring Counter': 'RING_COUNTER',
      'Johnson Counter': 'JOHNSON_COUNTER'
    }
    
    try {
      // Create simulation on Backend
      const res = await fetch('http://localhost:3001/api/simulations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circuitType: typeMap[state.circuitType] || 'SHIFT_REGISTER',
          numFlipFlops: state.numFlipFlops,
          clockFrequency: state.clockFrequency,
          inputSequence: state.inputBitSequence.split('').map(Number)
        })
      })
      const sim = await res.json()
      
      // Run batch simulation seamlessly on Backend
      const runRes = await fetch(`http://localhost:3001/api/simulations/${sim.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycles: state.simulationCycles })
      })
      const runData = await runRes.json()
      
      const timingList = runData.timingData || []
      timingList.sort((a: any, b: any) => a.cycle - b.cycle)
      
      set({ 
        simulationId: sim.id,
        backendTimingData: timingList,
        isRunning: true, 
        isPaused: false,
        currentCycle: 0,
        timingData: [],
        flipFlops: initialFlipFlops(state.numFlipFlops)
      })

      // START HEARTBEAT
      const { _intervalId } = get()
      if (_intervalId) clearInterval(_intervalId)
      
      const interval = setInterval(() => {
        const { isRunning, isPaused, stepClock } = get()
        if (isRunning && !isPaused) {
          stepClock()
        }
      }, 1000 / state.clockFrequency)
      
      set({ _intervalId: interval })

    } catch (e) {
      console.error("Backend Error: ", e)
    }
  },
  
  pauseSimulation: () => set({ isPaused: true }),
  
  stepClock: () => {
    const state = get()
    
    if (state.hardwareMode) {
      // Hardware mode: defer to Arduino
      import('@/utils/serial').then(({ serialManager }) => {
        serialManager.send({ type: 'STEP' })
      })
      return
    }

    if (state.currentCycle >= state.backendTimingData.length) {
      // Simulation finished
      const { _intervalId } = get()
      if (_intervalId) clearInterval(_intervalId)
      set({ isRunning: false, _intervalId: null })
      return
    }
    
    const nextPoint = state.backendTimingData[state.currentCycle]
    if (!nextPoint) return
    
    let outputs: number[] = []
    try {
      outputs = JSON.parse(nextPoint.outputs)
    } catch(e) {}
    
    const newFlipFlops = state.flipFlops.map((ff, i) => ({
      ...ff,
      q: outputs[i] ?? 0,
      qBar: 1 - (outputs[i] ?? 0)
    }))
    
    const uiTimingPoint: TimingPoint = {
      time: state.currentCycle,
      clock: nextPoint.clock,
      input: nextPoint.input,
      outputs
    }
    
    set({
      flipFlops: newFlipFlops,
      currentCycle: state.currentCycle + 1,
      timingData: [...state.timingData, uiTimingPoint],
    })
  },
  
  resetSimulation: () => {
    const { _intervalId } = get()
    if (_intervalId) clearInterval(_intervalId)
    set((state) => ({
      isRunning: false,
      isPaused: false,
      currentCycle: 0,
      flipFlops: initialFlipFlops(state.numFlipFlops),
      timingData: [],
      activeSignals: [],
      _intervalId: null
    }))
  },
  
  updateFlipFlops: (states) => set({ flipFlops: states }),
  
  addTimingPoint: (point) => set((state) => ({ 
    timingData: [...state.timingData, point] 
  })),
  
  setDetectedCircuit: (circuit) => set({ detectedCircuit: circuit }),
  
  addActiveSignal: (signal) => set((state) => ({ 
    activeSignals: [...state.activeSignals, signal] 
  })),
  
  clearActiveSignals: () => set({ activeSignals: [] }),
  
  setSelectedComponent: (component) => set({ selectedComponent: component }),
  
  addChangedComponent: (component) => set((state) => {
    const updated = new Set(state.changedComponents)
    updated.add(component)
    return { changedComponents: updated }
  }),
  
  clearChangedComponents: () => set({ changedComponents: new Set() }),
  
  setDelayMs: (delay) => set({ delayMs: delay }),
  
  setLiveUpdate: (live) => set({ liveUpdate: live }),

  setProjectId: (id) => set({ projectId: id }),

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  stopSimulation: () => {
    const { _intervalId } = get()
    if (_intervalId) clearInterval(_intervalId)
    set({ isRunning: false, isPaused: false, _intervalId: null })
  },

  // Quantum Mode actions
  toggleQuantumMode: () => set((state) => ({ quantumMode: !state.quantumMode })),

  applyHadamard: () => {
    set((state) => {
      const { qubitAlpha: a, qubitBeta: b } = state
      const sq2 = Math.sqrt(2)
      return { qubitAlpha: (a + b) / sq2, qubitBeta: (a - b) / sq2 }
    })
    const state = get()
    if (state.hardwareMode) {
      import('@/utils/serial').then(({ serialManager }) => {
        serialManager.send({ type: 'QUANTUM_UPDATE', alpha: state.qubitAlpha, beta: state.qubitBeta })
      })
    }
  },

  applyPauliX: () => {
    set((state) => ({
      qubitAlpha: state.qubitBeta,
      qubitBeta: state.qubitAlpha,
    }))
    const state = get()
    if (state.hardwareMode) {
      import('@/utils/serial').then(({ serialManager }) => {
        serialManager.send({ type: 'QUANTUM_UPDATE', alpha: state.qubitAlpha, beta: state.qubitBeta })
      })
    }
  },

  measureQubit: () => {
    const { qubitAlpha, hardwareMode } = get()
    const prob0 = qubitAlpha * qubitAlpha
    const result = Math.random() < prob0 ? 0 : 1
    
    set({ qubitAlpha: result === 0 ? 1 : 0, qubitBeta: result === 0 ? 0 : 1 })
    
    if (hardwareMode) {
      import('@/utils/serial').then(({ serialManager }) => {
        serialManager.send({ type: 'MEASURE', collapsedState: result })
      })
    }
    
    return result
  },

  resetQubit: () => set({ qubitAlpha: 1, qubitBeta: 0 }),

  // Glitch Mode
  setGlitchMode: (enabled) => set({ glitchMode: enabled }),
}))
