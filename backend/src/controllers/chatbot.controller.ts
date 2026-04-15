import type { Request, Response } from 'express';

export const handleChat = async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages are required and must be an array' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const url = process.env.OPENROUTER_URL;

  if (!apiKey || !url) {
    return res.status(500).json({ error: 'API configuration is missing' });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:8080',
        'X-Title': 'NovaTech AI Assistant',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-lite-001',
        messages: [
          { 
            role: 'system', 
            content: `Eres Nova, la asistente de IA EXCLUSIVA de NovaTech. 
             REGLA CRÍTICA: Solo puedes responder preguntas relacionadas con NovaTech, sus productos (laptops NovaPro Book, Quantum Flow), componentes, servicios de hardware, soporte técnico y ofertas de la tienda.
             Si te preguntan sobre CUALQUIER otro tema (cocina, política, deportes, otros negocios, conocimientos generales no relacionados con hardware/NovaTech), responde amablemente: "Lo siento, como asistente de NovaTech, solo estoy capacitada para ayudarte con información sobre nuestros productos y servicios tecnológicos."
             Mantén tus respuestas profesionales, útiles y centradas en cerrar ventas o resolver dudas técnicas de los clientes de NovaTech. Responde siempre en español.` 
          },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return res.status(response.status).json({ error: 'Error from OpenRouter API' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
};
