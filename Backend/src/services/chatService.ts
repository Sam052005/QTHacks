import Groq from 'groq-sdk';
import prisma from '../db.js';

export class ChatService {
  static async processMessage(projectId: string, message: string, apiKey: string, context: Record<string, any>) {
    const groq = new Groq({ apiKey });

    // Fetch memory (Prisma)
    const chatHistory = await prisma.chatMemory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' }
    });

    const systemPrompt = `You are an expert Digital Sequential Logic Simulator AI Assistant.
    You help users debug their 3D circuitry, explain logic gates, and analyze timing diagrams.
    Current Simulator Context:
    ${JSON.stringify(context, null, 2)}
    
    Answer concisely. Limit explanations to 3-4 sentences maximum. Use logic engineering terminology accurately.`;

    const groqMessages: Array<any> = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      messages: groqMessages,
      model: 'llama3-8b-8192',
      temperature: 0.3,
      max_tokens: 512,
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
      orderBy: { createdAt: 'asc' }
    });
  }
}
