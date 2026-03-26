import prisma from './db.js';

async function seed() {
  const challenges = [
    // ── EASY ───────────────────────────────────────────
    {
      id: 'shift-basic',
      title: 'Shift Register Basics',
      description: 'Load a known pattern into a shift register and watch it propagate.',
      difficulty: 'easy',
      objective: 'Input pattern "1001" into a 4-bit Shift Register. Observe it shift left by one position each clock cycle.',
      testCases: JSON.stringify({ circuitType: 'Shift Register', numFlipFlops: 4, expectedPattern: '1001' }),
      hints: JSON.stringify([
        'The first flip-flop captures the serial input.',
        'Each subsequent flip-flop takes Q from the previous one.',
      ]),
    },
    {
      id: 'ring-detect',
      title: 'Recognize a Ring Counter',
      description: 'Ring counters have a single rotating "1" bit — learn to identify them.',
      difficulty: 'easy',
      objective: 'Configure a 4-bit Ring Counter. Verify that exactly 4 unique, non-repeating states appear before the pattern loops.',
      testCases: JSON.stringify({ circuitType: 'Ring Counter', numFlipFlops: 4, minUniqueStates: 4 }),
      hints: JSON.stringify([
        'The output of the last flip-flop feeds back to the input of the first.',
        'Initial state: only one bit should be HIGH.',
      ]),
    },
    {
      id: 'd-flipflop-latch',
      title: 'D Flip-Flop Memory',
      description: 'Understand how a D flip-flop stores a single bit of data.',
      difficulty: 'easy',
      objective: 'Use a 1-bit D Flip-Flop. Toggle the input bit. Verify the output Q captures the value on the rising clock edge.',
      testCases: JSON.stringify({ circuitType: 'D Flip-Flop', numFlipFlops: 1 }),
      hints: JSON.stringify([
        'Q follows D only on the rising edge of the clock.',
        'The setup time must be satisfied for reliable capture.',
      ]),
    },

    // ── MEDIUM ─────────────────────────────────────────
    {
      id: 'johnson-states',
      title: 'Count Johnson States',
      description: 'Johnson counters generate 2N unique states — twice that of a ring counter.',
      difficulty: 'medium',
      objective: 'Set up a 4-bit Johnson Counter. Observe and count 8 unique states (2 × N flip-flops).',
      testCases: JSON.stringify({ circuitType: 'Johnson Counter', numFlipFlops: 4, minUniqueStates: 8 }),
      hints: JSON.stringify([
        'The Johnson counter feeds Q-bar (inverted output) back instead of Q.',
        'Start from all zeros — the counter will self-start.',
      ]),
    },
    {
      id: 'delay-chain',
      title: 'Propagation Delay Chain',
      description: 'Each flip-flop in a series adds exactly one clock cycle of delay.',
      difficulty: 'medium',
      objective: 'Input sequence "101" and verify the output appears exactly N clock cycles later in an N-stage D flip-flop chain.',
      testCases: JSON.stringify({ circuitType: 'D Flip-Flop', numFlipFlops: 3, expectedPattern: '101' }),
      hints: JSON.stringify([
        'A 3-stage chain delays the signal by 3 clock cycles.',
        'Use the timing diagram to compare input vs output timing.',
      ]),
    },
    {
      id: 'frequency-div',
      title: 'Frequency Divider',
      description: 'T flip-flops divide the clock frequency in half on every toggle.',
      difficulty: 'medium',
      objective: 'Create a ÷8 frequency divider using a 3-stage T flip-flop chain. Verify Q3 toggles at 1/8 the input frequency.',
      testCases: JSON.stringify({ circuitType: 'T Flip-Flop', numFlipFlops: 3 }),
      hints: JSON.stringify([
        'Each T flip-flop divides the frequency by 2.',
        'Three T flip-flops in series divide by 2³ = 8.',
      ]),
    },
    {
      id: 'gray-code-3bit',
      title: '3-bit Gray Code Counter',
      description: 'Gray code changes only one bit between consecutive states, minimising glitches.',
      difficulty: 'medium',
      objective: 'Configure JK flip-flops to produce the 3-bit Gray code sequence: 000→001→011→010→110→111→101→100.',
      testCases: JSON.stringify({ circuitType: 'JK Flip-Flop', numFlipFlops: 3, minUniqueStates: 8 }),
      hints: JSON.stringify([
        'Gray code sequences are derived by XOR-ing adjacent binary values.',
        'Only one output bit changes between any two consecutive states.',
      ]),
    },

    // ── HARD ───────────────────────────────────────────
    {
      id: 'sequence-detect',
      title: 'Pattern Sequence Detector',
      description: 'Shift registers act as short-term memory to detect recurring patterns.',
      difficulty: 'hard',
      objective: 'Configure a 4-bit Shift Register to detect the sequence "1011" in a continuous input stream.',
      testCases: JSON.stringify({ circuitType: 'Shift Register', numFlipFlops: 4, expectedPattern: '1011' }),
      hints: JSON.stringify([
        'The shift register stores the last 4 input bits.',
        'Compare all 4 outputs simultaneously against the target pattern.',
        'Try input sequence "01011001" to trigger a detection.',
      ]),
    },
    {
      id: 'jk-toggle-control',
      title: 'JK Flip-Flop Toggle Master',
      description: 'JK flip-flops have four distinct modes: Hold, Set, Reset, and Toggle.',
      difficulty: 'hard',
      objective: 'Using JK flip-flops, demonstrate all 4 operating modes by changing J and K inputs. Record state transitions for each mode.',
      testCases: JSON.stringify({ circuitType: 'JK Flip-Flop', numFlipFlops: 4, minUniqueStates: 4 }),
      hints: JSON.stringify([
        'J=0, K=0 → Hold state.',
        'J=1, K=0 → Set (Q=1).',
        'J=0, K=1 → Reset (Q=0).',
        'J=1, K=1 → Toggle Q.',
      ]),
    },
    {
      id: 'sr-hazard-detect',
      title: 'SR Latch Hazard Analysis',
      description: 'The forbidden state in an SR flip-flop causes unpredictable output — learn to identify it.',
      difficulty: 'hard',
      objective: 'Using an SR Flip-Flop, deliberately enter the forbidden state (S=1, R=1) and observe unstable Q/Q-bar behaviour. Then reset it cleanly.',
      testCases: JSON.stringify({ circuitType: 'SR Flip-Flop', numFlipFlops: 2 }),
      hints: JSON.stringify([
        'When S=R=1, both Q and Q-bar attempt to be 1 simultaneously.',
        'This is called a "race condition" or "metastability."',
        'Always ensure S and R are never simultaneously HIGH in a real design.',
      ]),
    },
  ];

  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`✅ Seeded ${challenges.length} challenges!`);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
