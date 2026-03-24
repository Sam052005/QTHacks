export interface CircuitMapping {
  description: string
  ic: string
  application: string
  frequency: string
  fun_fact: string
}

export const CIRCUIT_MAPPINGS: Record<string, CircuitMapping> = {
  'Shift Register': {
    description: 'Moves binary data one position per clock cycle in a chain of flip-flops.',
    ic: '74HC595',
    application: 'UART / SPI serial communication, LED matrix drivers',
    frequency: '≤ 100 MHz',
    fun_fact: 'The shift register inside a USB-to-UART chip converts your keystrokes to serial signals!',
  },
  'Ring Counter': {
    description: 'A circular shift register where the output of the last FF feeds the first.',
    ic: '74HC164',
    application: 'LED chasers, state machine sequencers, pixel color cycling',
    frequency: '≤ 80 MHz',
    fun_fact: 'Ring counters are how old-school Knight Rider KITT car LEDs were controlled.',
  },
  'Johnson Counter': {
    description: 'A twisted ring counter using Q-bar feedback, creating 2N states from N FFs.',
    ic: 'CD4022',
    application: 'Frequency division, sine wave approximation, phase generators',
    frequency: '≤ 50 MHz',
    fun_fact: 'Johnson counters are used inside PLLs to generate multi-phase clock signals for CPUs.',
  },
  'D Flip-Flop': {
    description: 'The basic data latch — captures and holds a single bit on the clock edge.',
    ic: '74HC74',
    application: 'Pipeline stages, register files in CPUs, data latches',
    frequency: '≤ 125 MHz',
    fun_fact: 'Every single RAM cell in your computer is built from cascaded D Flip-Flops.',
  },
  'JK Flip-Flop': {
    description: 'A universal flip-flop that can set, reset, or toggle based on J and K inputs.',
    ic: '74HC107',
    application: 'Binary counters, frequency dividers, toggle switches',
    frequency: '≤ 75 MHz',
    fun_fact: 'The JK flip-flop is named after Jack Kilby, the inventor of the integrated circuit.',
  },
  'T Flip-Flop': {
    description: 'A toggle flip-flop that flips its state every clock when T=1.',
    ic: '74HC73',
    application: 'Binary ripple counters, clock dividers, debounce circuits',
    frequency: '≤ 100 MHz',
    fun_fact: 'T Flip-Flops are chained inside digital clocks to count seconds → minutes → hours.',
  },
}
