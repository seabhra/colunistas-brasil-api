
// api/chat.js versão 1

export default async function handler(req, res) {
  // Aceita apenas método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Pega a API Key das variáveis de ambiente (Settings > Env Vars no Vercel)
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.error("Faltando GROQ_API_KEY nas variáveis de ambiente");
      return res.status(500).json({ error: "Configuração do servidor ausente (API Key)" });
    }

    // Recebe os dados enviados pelo Frontend
    const { messages, model } = req.body;

    // Faz a chamada para o Groq
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
      console.error("Erro na resposta do Groq:", errorData);
      return res.status(groqResponse.status).json({ error: errorData.error?.message || "Erro na IA" });
    }

    const data = await groqResponse.json();

    // Retorna o sucesso para o Frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

