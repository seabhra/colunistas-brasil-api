import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // No App Router do Next.js, usamos 'await request.json()' para ler o corpo
    const body = await request.json();
    const { messages, model } = body;

    // Pega a chave do ambiente
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.error("Faltando GROQ_API_KEY nas variáveis de ambiente");
      return NextResponse.json({ error: "Configuração do servidor ausente (API Key)" }, { status: 500 });
    }

    // Chama a API do Groq
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error("Erro Groq API:", errorData);
      return NextResponse.json({ error: errorData.error?.message || "Erro na IA" }, { status: groqResponse.status });
    }

    const data = await groqResponse.json();

    // Retorna usando NextResponse
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro no servidor:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
