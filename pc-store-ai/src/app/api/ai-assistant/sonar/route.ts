import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

interface ChatCompletionOptions {
  messages: { role: string; content: string }[];
  max_tokens?: number;
  temperature?: number;
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

interface UserPreferences {
  CPU: string | null;
  GPU: string | null;
  RAM: string | null;
  motherboard: string | null;
  storage: string | null;
  PSU: string | null;
  case: string | null;
  cooling: string | null;
  budget: number | null;
}

const defaultPreferences: UserPreferences = {
  CPU: null,
  GPU: null,
  RAM: null,
  motherboard: null,
  storage: null,
  PSU: null,
  case: null,
  cooling: null,
  budget: null
};

const openai = {
  chat: {
    completions: {
      create: async (options: ChatCompletionOptions): Promise<ChatCompletionResponse> => {
        try {
          const response = await fetch("https://api.perplexity.ai/chat/completions", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
              model: "sonar-pro",
              messages: options.messages,
              max_tokens: options.max_tokens || undefined,
              temperature: options.temperature || undefined
            })
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error("Perplexity API Error:", errorData);
            throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          return data;
        } catch (error) {
          console.error("Error calling Perplexity API:", error);
          throw error;
        }
      }
    }
  }
};

const parseUserMessage = async (message: string): Promise<UserPreferences> => {
  const systemParseMessage = `
You are a text parser. Your task is to analyze the user's text and extract possible parameters: processor (CPU), graphics card (GPU), RAM memory, motherboard, storage, power supply (PSU), case, cooling, budget.
If something is not mentioned, set the value to null.
Return only a JSON object with keys: "CPU", "GPU", "RAM", "motherboard", "storage", "PSU", "case", "cooling", "budget".
Do not add any other text, comments, or explanations.
`;

  const userParsePrompt = `User text: "${message}"`;

  try {
    const parseResponse = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemParseMessage },
        { role: "user", content: userParsePrompt },
      ],
      max_tokens: 150,
      temperature: 0
    });

    console.log('Parse Response:', parseResponse);

    try {
      const parsedResult = JSON.parse(parseResponse.choices[0]?.message?.content || "{}");
      return { ...defaultPreferences, ...parsedResult };
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return { ...defaultPreferences };
    }
  } catch (error) {
    console.error("Error in parseUserMessage:", error);
    return { ...defaultPreferences };
  }
};

export const dynamic = 'force-dynamic';

export async function OPTIONS() {
  return NextResponse.json({}, { 
    headers: {
      'Allow': 'POST',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: `Method ${req.method} Not Allowed` },
      { status: 405 }
    );
  }

  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const preferences: UserPreferences = await parseUserMessage(message);

    const systemMessage = `You are a computer building expert. Based on the user's preferences, suggest optimal components.
Consider component compatibility, performance, and budget. Respond in Markdown format.`;

    const userPrompt = `The user provided the following computer preferences:
- **CPU:** ${preferences.CPU || "Not specified"}
- **GPU:** ${preferences.GPU || "Not specified"}
- **RAM:** ${preferences.RAM || "Not specified"}
- **Motherboard:** ${preferences.motherboard || "Not specified"}
- **Storage:** ${preferences.storage || "Not specified"}
- **PSU:** ${preferences.PSU || "Not specified"}
- **Case:** ${preferences.case || "Not specified"}
- **Cooling:** ${preferences.cooling || "Not specified"}
- **Budget:** ${preferences.budget ? `$${preferences.budget}` : "Not specified"}

Please suggest an optimal configuration.`;

    try {
      const response = await openai.chat.completions.create({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 700,
        temperature: 0.7
      });

      console.log('Response:', response);

      const generatedText = response.choices[0]?.message?.content || "Failed to generate a response.";
      return NextResponse.json({ reply: generatedText });
    } catch (error) {
      console.error("Error generating response:", error);
      return NextResponse.json({ error: "Failed to generate a response from the AI." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error in API:", error);
    return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 });
  }  
}
