import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const parseUserMessage = async (message: string) => {
  const systemParseMessage = `
You are a text parser. Your task is to analyze the user's text and extract possible parameters: processor (CPU), graphics card (GPU), RAM memory, motherboard, storage, power supply (PSU), case, cooling, budget.
If something is not mentioned, set the value to null.
Return only a JSON object with keys: "CPU", "GPU", "RAM", "motherboard", "storage", "PSU", "case", "cooling", "budget".
Do not add any other text, comments, or explanations.
`;

  const userParsePrompt = `User text: "${message}"`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: systemParseMessage }, { text: userParsePrompt }] }],
    }),
  });

  const data = await response.json();
  try {
    return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
  } catch {
    return {};
  }
};

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        Allow: 'POST',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    },
  );
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
  }

  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const preferences = await parseUserMessage(message);

    const systemMessage = `
You are a computer building expert. Based on the user's preferences, suggest optimal components.
Consider component compatibility, performance, and budget. Respond in Markdown format.
`;

    const userPrompt = `
The user provided the following computer preferences:
- **CPU:** ${preferences.CPU || 'Not specified'}
- **GPU:** ${preferences.GPU || 'Not specified'}
- **RAM:** ${preferences.RAM || 'Not specified'}
- **Motherboard:** ${preferences.motherboard || 'Not specified'}
- **Storage:** ${preferences.storage || 'Not specified'}
- **PSU:** ${preferences.PSU || 'Not specified'}
- **Case:** ${preferences.case || 'Not specified'}
- **Cooling:** ${preferences.cooling || 'Not specified'}
- **Budget:** ${preferences.budget ? `$${preferences.budget}` : 'Not specified'}

Please suggest an optimal configuration.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemMessage }, { text: userPrompt }] }],
      }),
    });

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response structure:', data);
      return NextResponse.json({ reply: 'Failed to generate a response.' });
    }

    return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
