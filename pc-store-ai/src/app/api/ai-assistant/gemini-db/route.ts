import { NextRequest, NextResponse } from 'next/server';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import { Product } from '../../../../models/product';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

mongoose.set('bufferCommands', false);

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(mongoUri);
  }
};

const parseUserMessage = async (message: string) => {
  const systemParseMessage = `
You are a text parser. Your task is to analyze the user's text and extract possible parameters: brand, component type, model, maximum budget, and other product specifications such as RAM, processor, graphics card, etc.

Component types include:
- PC Components (CPU, GPU, RAM, Motherboard, Storage, Power Supply, Case)
- Peripherals (Keyboard, Mouse, Headset, Webcam, Microphone, Speakers)
- Monitors (Gaming, Office, Professional, Ultrawide)

If the user asks for monitors or peripherals, make sure to set the componentType field accordingly.
If the user mentions "monitors", "monitor", "display", or "screen", set componentType to "Monitor".
If the user mentions "peripherals", "keyboard", "mouse", "headset", etc., set componentType to the specific peripheral type.
If the user mentions multiple peripheral types (e.g., "keyboard and mouse"), set componentType to "Peripheral" to indicate multiple types.

If something is not mentioned, set the value to null.
Return only a JSON object with keys: "brand", "componentType", "model", "budget", "ram", "cpu", "gpu".
For budget, return only the numeric value without currency symbols or units.
Do not add any other text, comment, or explanation.
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

interface Preferences {
  brand?: string;
  componentType?: string;
  model?: string;
  budget?: number;
  ram?: number;
  cpu?: string;
  gpu?: string;
}

const buildQuery = (preferences: Preferences) => {
  const query: { [key: string]: { $regex?: string; $options?: string; $lte?: number } | string | number } = {};
  if (preferences.brand) {
    query.brand = { $regex: preferences.brand, $options: 'i' };
  }
  if (preferences.componentType) {
    query.componentType = { $regex: preferences.componentType, $options: 'i' };
  }
  if (preferences.model) {
    query.model = { $regex: preferences.model, $options: 'i' };
  }
  if (preferences.cpu) {
    query.cpu = { $regex: preferences.cpu, $options: 'i' };
  }
  if (preferences.gpu) {
    query.gpu = { $regex: preferences.gpu, $options: 'i' };
  }
  if (preferences.ram) {
    query.ram = preferences.ram;
  }
  if (preferences.budget) {
    query.price = { $lte: preferences.budget };
  }
  return query;
};

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
  }

  try {
    await connectToDatabase();

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const preferences = await parseUserMessage(message);

    if (message.toLowerCase().includes('monitor') || message.toLowerCase().includes('display') || message.toLowerCase().includes('screen')) {
      preferences.componentType = 'Monitor';
    }

    const peripheralTerms = ['keyboard', 'mouse', 'headset', 'headphone', 'webcam', 'speaker', 'peripheral'];
    const mentionedPeripherals = peripheralTerms.filter(term => message.toLowerCase().includes(term));

    if (mentionedPeripherals.length > 1) {
      preferences.componentType = 'Peripheral';
      console.log(`Multiple peripheral types mentioned: ${mentionedPeripherals.join(', ')}`);
    } else if (message.toLowerCase().includes('peripheral')) {
      preferences.componentType = 'Peripheral';
    } else if (message.toLowerCase().includes('keyboard')) {
      preferences.componentType = 'Keyboard';
    } else if (message.toLowerCase().includes('mouse')) {
      preferences.componentType = 'Mouse';
    } else if (message.toLowerCase().includes('headset') || message.toLowerCase().includes('headphone')) {
      preferences.componentType = 'Headset';
    } else if (message.toLowerCase().includes('webcam')) {
      preferences.componentType = 'Webcam';
    } else if (message.toLowerCase().includes('speaker')) {
      preferences.componentType = 'Speaker';
    }

    const query = buildQuery(preferences);

    console.log('User message:', message);
    console.log('Parsed preferences:', preferences);
    console.log('Query:', JSON.stringify(query));

    let products = await Product.find(query).limit(10).exec();

    let productList = '';

    if (products.length > 0) {
      productList = products
        .map((product, index) => {
          let specs = '';
          if (product.componentType && product.componentType.toLowerCase().includes('monitor')) {
            specs = `- **Specifications**:
  - **Resolution**: ${product.resolution || 'N/A'}
  - **Refresh Rate**: ${product.refreshRate ? `${product.refreshRate} Hz` : 'N/A'}
  - **Panel Type**: ${product.panelType || 'N/A'}`;
          } else if (product.componentType && ['keyboard', 'mouse', 'headset', 'webcam', 'speaker'].some(type => product.componentType.toLowerCase().includes(type))) {
            specs = `- **Specifications**:
  - **Type**: ${product.componentType || 'N/A'}
  - **Connection**: ${product.connection || 'N/A'}
  - **Features**: ${product.features || 'N/A'}`;
          } else {
            specs = `- **Specifications**:
  - **CPU**: ${product.cpu || 'N/A'}
  - **GPU**: ${product.gpu || 'N/A'}
  - **RAM**: ${product.ram ? `${product.ram} GB` : 'N/A'}`;
          }

          return `### Product ${index + 1}: **${product.name}**
- **Brand**: ${product.brand}
- **Component Type**: ${product.componentType || 'N/A'}
- **Price**: ${product.price} PLN
${specs}`;
        })
        .join('\n\n');

      const systemMessage = `You are a computer component selection assistant. You help customers find the right products including PC Components, Peripherals (Keyboard, Mouse, Headset, Webcam, Microphone, Speakers), and Monitors (Gaming, Office, Professional, Ultrawide). You have a list of products with specific numbering. Do not change, remove, or add numbers. Base your recommendations solely on these products and format in Markdown with bold text.`;
      const userPrompt = `${message}\n\nHere are the available products:\n${productList}\n\nPlease provide recommendations.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemMessage }, { text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: 700,
            temperature: 0.7,
          },
        }),
      });

      const data = await response.json();

      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid response structure:', data);
        return NextResponse.json({ reply: 'Failed to generate a response.' });
      }

      return NextResponse.json({ reply: data.candidates[0].content.parts[0].text });
    } else {
      return NextResponse.json({ reply: 'Unfortunately, no products matching your criteria were found.' });
    }
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
