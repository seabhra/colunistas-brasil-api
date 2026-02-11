
// api/chat.js versão 5

// api/chat.js
export default async function handler(req, res) {
  // Configurações de CORS (permitir que o frontend chame a API)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Resposta rápida para requisições de "preflight" (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { messages, model } = req.body;

    // Pega a chave da variável de ambiente da Vercel
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Chave da API (GROQ_API_KEY) não configurada no servidor.' });
    }

    // Chama a API da Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: messages,
        temperature: 0.9,
        max_tokens: 1024
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da Groq:", data);
      return res.status(response.status).json(data);
    }

    // Retorna a resposta para o frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
