import Groq from 'groq-sdk';
import prisma from '../db.js';

const CIRCUIT_ACTIONS_SCHEMA = `
You can modify the circuit state by including a single JSON action block at the END of your response.
Format it EXACTLY like this (do not break the structure):
[ACTION: {"type": "SET_CIRCUIT", "circuitType": "D Flip-Flop", "numFlipFlops": 4, "frequency": 2, "inputBits": "1010"}]

Available action types and their fields:
- SET_CIRCUIT: circuitType (one of: "D Flip-Flop", "JK Flip-Flop", "T Flip-Flop", "SR Flip-Flop", "Shift Register", "Ring Counter", "Johnson Counter"), numFlipFlops (1-8), frequency (0.5-10), inputBits (binary string)
- RESET_SIMULATION: (no additional fields)
- SET_INPUT: inputBits (binary string only, e.g., "10110")
- SET_FREQUENCY: frequency (number 0.5-10)
- SET_FLIP_FLOPS: numFlipFlops (number 1-8)

Only include an action block if the user explicitly asked to change the circuit. Otherwise, just explain or debug.
`;

export class ChatService {
  static async processMessage(projectId: string, message: string, context: Record<string, any>) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your-groq-api-key-here') {
      throw new Error('GROQ_API_KEY is not configured in the backend .env file.');
    }

    const groq = new Groq({ apiKey });

    // Fetch memory (Prisma)
    const chatHistory = await prisma.chatMemory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      take: 20 // Limit memory to last 20 messages
    });

    const systemPrompt = `You are an expert Digital Sequential Logic Simulator AI Assistant with DIRECT CONTROL over the circuit simulator.
You help users debug, explain, and modify their 3D circuitry.

Current Simulator Context:
${JSON.stringify(context, null, 2)}

${CIRCUIT_ACTIONS_SCHEMA}

Important rules:
1. Be concise — 2-3 sentences for explanations.
2. Use engineering terminology accurately.
3. If the user asks you to change something, include the [ACTION: ...] block to apply it immediately.
4. If you include an action, still briefly explain what you're doing.`;

    const groqMessages: Array<any> = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 768,
    });

    const reply = completion.choices[0]?.message?.content || 'No response from Groq API.';

    // Save turn to Prisma
    await prisma.chatMemory.createMany({
      data: [
        { projectId, role: 'user', content: message },
        { projectId, role: 'assistant', content: reply }
      ]
    });

    return reply;
  }
  
  static async getHistory(projectId: string) {
    return prisma.chatMemory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
  }
}
