import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Product } from '../../../../models/product';
import mongoose from 'mongoose';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const parseResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemParseMessage },
      { role: 'user', content: userParsePrompt },
    ],
    max_tokens: 150,
    temperature: 0,
  });

  let parsedData;
  try {
    parsedData = JSON.parse(parseResponse.choices[0]?.message?.content || '{}');
  } catch {
    parsedData = {};
  }
  return parsedData;
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
    let budgetValue: number;
    if (typeof preferences.budget === 'string') {
      const numericValue = (preferences.budget as string).replace(/[^\d.]/g, '');
      budgetValue = parseFloat(numericValue);
    } else {
      budgetValue = preferences.budget;
    }

    if (!isNaN(budgetValue)) {
      query.price = { $lte: budgetValue };
    }
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

    if (message.toLowerCase().includes('monitor') || (preferences.componentType && preferences.componentType.toLowerCase().includes('monitor'))) {
      console.log('Attempting to find monitors with various queries');

      let products = [];

      try {
        products = await Product.find(query).limit(10).exec();
        console.log(`Found ${products.length} monitors with specific query`);
      } catch (error) {
        console.error('Error with specific query:', error);
      }

      if (products.length === 0) {
        try {
          console.log('Trying to find monitors by componentType');
          products = await Product.find({ componentType: { $regex: 'monitor', $options: 'i' } })
            .limit(10)
            .exec();
          console.log(`Found ${products.length} monitors by componentType`);
        } catch (error) {
          console.error('Error finding by componentType:', error);
        }
      }

      if (products.length === 0) {
        try {
          console.log('Trying to find monitors by name');
          products = await Product.find({ name: { $regex: 'monitor', $options: 'i' } })
            .limit(10)
            .exec();
          console.log(`Found ${products.length} monitors by name`);
        } catch (error) {
          console.error('Error finding by name:', error);
        }
      }

      if (products.length === 0) {
        try {
          console.log('Trying to find monitors by specifications');
          products = await Product.find({
            $or: [
              { 'specifications.type': { $regex: 'monitor', $options: 'i' } },
              { 'specifications.category': { $regex: 'monitor', $options: 'i' } },
              { 'specifications.panel': { $exists: true } },
              { 'specifications.resolution': { $exists: true } },
              { 'specifications.refresh_rate': { $exists: true } },
            ],
          })
            .limit(10)
            .exec();
          console.log(`Found ${products.length} monitors by specifications`);
        } catch (error) {
          console.error('Error finding by specifications:', error);
        }
      }

      if (products.length === 0) {
        try {
          console.log('Last resort: Getting any products that might be monitors');
          const allProducts = await Product.find().limit(100).exec();
          products = allProducts
            .filter(p => {
              const productString = JSON.stringify(p).toLowerCase();
              return (
                productString.includes('monitor') ||
                productString.includes('display') ||
                productString.includes('screen') ||
                productString.includes('resolution') ||
                productString.includes('refresh') ||
                productString.includes('panel')
              );
            })
            .slice(0, 10);
          console.log(`Found ${products.length} potential monitors with last resort approach`);
        } catch (error) {
          console.error('Error with last resort approach:', error);
        }
      }

      if (products.length > 0) {
        console.log(`Found ${products.length} monitors`);

        const productList = products
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

        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 700,
          temperature: 0.7,
        });

        const generatedText = response.choices[0]?.message?.content || 'Failed to generate a response.';
        return NextResponse.json({ reply: generatedText });
      } else {
        return NextResponse.json({ reply: 'Unfortunately, no products matching your criteria were found.' });
      }
    } else if (message.toLowerCase().includes('peripheral') || ['keyboard', 'mouse', 'headset', 'headphone', 'webcam', 'speaker'].some(term => message.toLowerCase().includes(term))) {
      console.log('Attempting to find peripherals with various queries');

      let products = [];

      try {
        products = await Product.find(query).limit(10).exec();
        console.log(`Found ${products.length} peripherals with specific query`);
      } catch (error) {
        console.error('Error with specific query:', error);
      }

      if (products.length === 0) {
        try {
          console.log('Trying to find peripherals by componentType');
          products = await Product.find({
            componentType: {
              $regex: 'keyboard|mouse|headset|webcam|speaker|peripheral',
              $options: 'i',
            },
          })
            .limit(10)
            .exec();
          console.log(`Found ${products.length} peripherals by componentType`);
        } catch (error) {
          console.error('Error finding by componentType:', error);
        }
      }

      if (products.length === 0) {
        try {
          console.log('Trying to find peripherals by name');

          const mentionedPeripheralTerms = peripheralTerms.filter(term => message.toLowerCase().includes(term));
          let nameRegex = 'keyboard|mouse|headset|webcam|speaker|peripheral';

          if (mentionedPeripheralTerms.length > 0 && !mentionedPeripheralTerms.includes('peripheral')) {
            nameRegex = mentionedPeripheralTerms.join('|');
            console.log(`Searching specifically for: ${nameRegex}`);
          }

          products = await Product.find({
            name: {
              $regex: nameRegex,
              $options: 'i',
            },
          })
            .limit(10)
            .exec();
          console.log(`Found ${products.length} peripherals by name`);
        } catch (error) {
          console.error('Error finding by name:', error);
        }
      }

      if (products.length === 0) {
        try {
          console.log('Trying to find peripherals by specifications');
          products = await Product.find({
            $or: [
              { 'specifications.type': { $regex: 'keyboard|mouse|headset|webcam|speaker', $options: 'i' } },
              { 'specifications.category': { $regex: 'peripheral', $options: 'i' } },
              { 'specifications.connection': { $exists: true } },
              { 'specifications.interface': { $exists: true } },
            ],
          })
            .limit(10)
            .exec();
          console.log(`Found ${products.length} peripherals by specifications`);
        } catch (error) {
          console.error('Error finding by specifications:', error);
        }
      }

      if (products.length === 0) {
        try {
          console.log('Last resort: Getting any products that might be peripherals');
          const allProducts = await Product.find().limit(100).exec();
          products = allProducts
            .filter(p => {
              const productString = JSON.stringify(p).toLowerCase();
              return (
                productString.includes('keyboard') ||
                productString.includes('mouse') ||
                productString.includes('headset') ||
                productString.includes('webcam') ||
                productString.includes('speaker') ||
                productString.includes('peripheral') ||
                productString.includes('usb') ||
                productString.includes('wireless')
              );
            })
            .slice(0, 10);
          console.log(`Found ${products.length} potential peripherals with last resort approach`);
        } catch (error) {
          console.error('Error with last resort approach:', error);
        }
      }

      if (products.length > 0) {
        console.log(`Found ${products.length} peripherals`);

        const productList = products
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

        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 700,
          temperature: 0.7,
        });

        const generatedText = response.choices[0]?.message?.content || 'Failed to generate a response.';
        return NextResponse.json({ reply: generatedText });
      } else {
        return NextResponse.json({ reply: 'Unfortunately, no products matching your criteria were found.' });
      }
    } else {
      const products = await Product.find(query).limit(10).exec();

      if (products.length === 0) {
        return NextResponse.json({ reply: 'Unfortunately, no products matching your criteria were found.' });
      }

      const productList = products
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

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 700,
        temperature: 0.7,
      });

      const generatedText = response.choices[0]?.message?.content || 'Failed to generate a response.';
      return NextResponse.json({ reply: generatedText });
    }
  } catch (err) {
    console.error('Error in API:', err);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
