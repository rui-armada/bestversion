import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Tu és o BestVersion AI, um coach pessoal. Respondes em Português de Portugal, de forma concisa e prática.
Ajudas com: treino, saúde, investimentos, objetivos, hábitos, livros. Sê direto e motivador.`;

const MODELS = ['gemini-2.5-flash'];

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return NextResponse.json(
      { error: 'Gemini API key não configurada. Adiciona GEMINI_API_KEY ao ficheiro .env.local' },
      { status: 500 }
    );
  }

  try {
    const { messages, userContext } = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);

    // Build compact context
    let contextMessage = SYSTEM_PROMPT;
    if (userContext) {
      contextMessage += `\nDados do utilizador: ${JSON.stringify(userContext)}`;
    }

    const lastMessage = messages[messages.length - 1].content;

    // Keep only last 6 messages for history to save tokens
    const recentMessages = messages.slice(-7, -1);
    const history = recentMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Try models in order until one works
    let lastError: unknown = null;
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
          history: [
            { role: 'user', parts: [{ text: contextMessage }] },
            { role: 'model', parts: [{ text: 'Entendido! Sou o BestVersion AI. Como posso ajudar?' }] },
            ...history,
          ],
        });

        const result = await chat.sendMessage(lastMessage);
        const response = result.response.text();
        return NextResponse.json({ message: response });
      } catch (e) {
        lastError = e;
        continue;
      }
    }

    throw lastError;
  } catch (error: unknown) {
    console.error('Gemini API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json(
      { error: `Erro ao comunicar com o Gemini: ${errorMessage}` },
      { status: 500 }
    );
  }
}
