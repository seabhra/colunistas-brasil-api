
// pages/api/chat.js - VERSÃO 4 Anora Tarô com Cors


export default async function handler(req, res) {
  // ==========================================
  // CORS HEADERS (Boas práticas, mesmo que o Next.js já lide bem localmente)
  // ==========================================
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Preflight (Opcional, mas ajuda navegadores estritos)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Garante que apenas POST é aceito
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // O Frontend envia { messages: [...] }
    const { messages } = req.body;

    // Validação básica
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'O campo "messages" é obrigatório e deve ser um array.' });
    }

    console.log('📥 Requisição recebida da Groq API:', messages.length, 'mensagens');

    // Chamada para API da Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // IMPORTANTE: Certifique-se que a variável GROQ_API_KEY existe na Vercel
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        // Usando o Llama 3.3 que é rápido e barato
       
        model: 'qwen/qwen3.6-27b', 
        messages: messages,
        temperature: 0.7,
        max_tokens: 900 // Suficiente para uma leitura de tarô
      })
    });

    // Verifica erro na resposta da Groq
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Erro na API da Groq:', errorData);
      
      // Retorna o erro específico da Groq para debug
      return res.status(response.status).json({ 
        error: `Erro Groq: ${errorData.error?.message || response.statusText}` 
      });
    }

    const data = await response.json();
    console.log('✅ Resposta enviada com sucesso');
    
    // Retorna os dados no formato que o Frontend espera
    return res.status(200).json(data);

  } catch (error) {
    console.error('❌ Erro interno no servidor:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
