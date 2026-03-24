import prisma from './db.js';

async function seed() {
  const challenges = [
    {
      id: 'shift-basic',
      title: 'Understand Shift Registers',
      description: 'Load a known pattern and observe how it shifts',
      difficulty: 'easy',
      objective: 'Input pattern "1001" and verify it shifts left one position per clock cycle',
      testCases: '1001',
      hints: JSON.stringify(['The first flip-flop captures the input', 'Each other takes the Q from previous'])
    },
    {
      id: 'ring-detect',
      title: 'Recognize Ring Counter',
      description: 'Identify a ring counter pattern by its rotating "1"',
      difficulty: 'easy',
      objective: 'Set up a 4-bit ring counter and observe 4 unique states repeating',
      testCases: '1000',
      hints: JSON.stringify(['Last flip-flop Q feeds back to first flip-flop input'])
    },
    {
      id: 'johnson-states',
      title: 'Count Johnson States',
      description: 'Johnson counter has double the states of ring counter',
      difficulty: 'medium',
      objective: 'Verify 8-bit Johnson counter creates 8 unique states (2N for N flip-flops)',
      testCases: '',
      hints: JSON.stringify(['Uses Q-bar feedback instead of Q feedback'])
    }
  ];

  for (const c of challenges) {
    await prisma.challenge.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }
  console.log('Challenges seeded!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
