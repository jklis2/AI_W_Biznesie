import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { Product } from '../../../../models/product'; // Zakładając, że masz model produktu z bazy danych MongoDB lub innej bazy danych.
import mongoose from 'mongoose';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set a longer timeout duration for Mongoose
mongoose.set('bufferCommands', false);

// Ensure database connection is established
const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 0) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(mongoUri);
  }
};

// Funkcja do parsowania wiadomości użytkownika
const parseUserMessage = async (message: string) => {
  const systemParseMessage = `
Jesteś parserem tekstu. Twoim zadaniem jest przeanalizować tekst użytkownika i wyodrębnić możliwe parametry: marka (brand), typ podzespołu (componentType), model (model), maksymalny budżet (budget), oraz inne specyfikacje produktu, takie jak pamięć RAM, procesor, karta graficzna itd. 
Jeżeli coś nie zostało wspomniane, ustaw wartość na null. 
Zwróć wyłącznie obiekt JSON z kluczami: "brand", "componentType", "model", "budget", "ram", "cpu", "gpu". 
Nie dodawaj żadnego innego tekstu, komentarza ani wyjaśnienia.
`;
  const userParsePrompt = `Tekst użytkownika: "${message}"`;

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

// Funkcja do budowy zapytania do bazy danych na podstawie preferencji użytkownika
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

// Funkcja obsługująca zapytania POST
export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: `Method ${req.method} Not Allowed` }, { status: 405 });
  }

  try {
    await connectToDatabase(); // Ensure database connection

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const preferences = await parseUserMessage(message);
    const query = buildQuery(preferences);

    // Zakładając, że masz model 'Product', który łączy się z bazą danych
    const products = await Product.find(query).limit(10).exec();

    if (products.length === 0) {
      return NextResponse.json({ reply: 'Niestety, nie znaleziono produktów pasujących do Twoich kryteriów.' });
    }

    const productList = products
      .map((product, index) => {
        return `### Produkt ${index + 1}: **${product.name}**
- **Marka**: ${product.brand}
- **Typ podzespołu**: ${product.componentType}
- **Cena**: ${product.price} PLN
- **Specyfikacje**:
  - **CPU**: ${product.cpu}
  - **GPU**: ${product.gpu}
  - **RAM**: ${product.ram} GB`;
      })
      .join('\n\n');

    const systemMessage = `Jesteś asystentem doboru podzespołów komputerowych. Masz listę produktów z konkretną numeracją. Nie zmieniaj jej, nie usuwaj ani nie dodawaj numerów. Bazuj wyłącznie na tych produktach i formatuj w Markdown z pogrubieniami.`;
    const userPrompt = `${message}\n\nOto dostępne produkty:\n${productList}\n\nProszę o rekomendacje.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 700,
      temperature: 0.7,
    });

    const generatedText = response.choices[0]?.message?.content || 'Nie udało się wygenerować odpowiedzi.';
    return NextResponse.json({ reply: generatedText });
  } catch (err) {
    console.error('Error in API:', err);
    return NextResponse.json({ error: 'Wystąpił błąd podczas przetwarzania Twojego żądania.' }, { status: 500 });
  }
}
