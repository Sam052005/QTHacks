export interface Challenge {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  expected: string // matches detectedCircuit
  objective: string
  verilogHint: string
  realWorldUse: string
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'shift-4bit',
    title: 'Build a 4-bit Shift Register',
    description: 'Chain 4 D Flip-Flops in series to create a classic SIPO shift register.',
    difficulty: 'Easy',
    expected: '4-bit Shift Register',
    objective: 'Set up a 4 FF Shift Register circuit and run the simulation.',
    verilogHint: 'always @(posedge clk) q <= {q[2:0], d};',
    realWorldUse: 'Used in serial-to-parallel data conversion (UART, SPI).',
  },
  {
    id: 'ring-4bit',
    title: 'Build a 4-bit Ring Counter',
    description: 'Create a self-cycling ring counter where a single 1 bit circulates.',
    difficulty: 'Easy',
    expected: '4-bit Ring Counter',
    objective: 'Set up a 4 FF Ring Counter and observe the rotating pattern.',
    verilogHint: 'always @(posedge clk) q <= {q[0], q[3:1]};',
    realWorldUse: 'Used in LED chaser circuits and state machine sequencers.',
  },
  {
    id: 'johnson-4bit',
    title: 'Build a 4-bit Johnson Counter',
    description: 'Create a twisted ring counter with Q-bar feedback for 2N unique states.',
    difficulty: 'Medium',
    expected: '4-bit Johnson Counter',
    objective: 'Set up a 4 FF Johnson Counter and verify 8 unique states.',
    verilogHint: 'always @(posedge clk) q <= {~q[0], q[3:1]};',
    realWorldUse: 'Used as a frequency divider and in phase generators.',
  },
  {
    id: 'johnson-8bit',
    title: 'Build an 8-bit Johnson Counter',
    description: 'Scale up to 8 bits for 16 unique states — a powerful state sequencer.',
    difficulty: 'Medium',
    expected: '8-bit Johnson Counter',
    objective: 'Build an 8 FF Johnson Counter and verify 16 unique states.',
    verilogHint: 'always @(posedge clk) q <= {~q[0], q[7:1]};',
    realWorldUse: 'Phase generation in PLL circuits and motor control systems.',
  },
  {
    id: 'shift-8bit',
    title: 'Build an 8-bit Serial Shift Register',
    description: 'Master the 8-bit shift register — the backbone of UART communication.',
    difficulty: 'Hard',
    expected: '8-bit Shift Register',
    objective: 'Build an 8 FF Shift Register with input pattern 10110100.',
    verilogHint: 'always @(posedge clk) q <= {q[6:0], d};',
    realWorldUse: 'Core of SPI and UART communication protocols.',
  },
]
