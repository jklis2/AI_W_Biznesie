export interface Assistant {
  name: string;
  gradientFrom: string;
  gradientTo: string;
  apiRoute: string;
  provider: string;
}

export const assistants: Assistant[] = [
  {
    name: "PC Store AI Assistant (GPT-4)",
    gradientFrom: "indigo-600",
    gradientTo: "blue-500",
    apiRoute: "/api/ai-assistant/openai",
    provider: "OpenAI"
  },
  {
    name: "PC Store AI Assistant (Copilot)",
    gradientFrom: "purple-600",
    gradientTo: "pink-500",
    apiRoute: "/api/ai-assistant/copilot",
    provider: "Microsoft"
  },
  {
    name: "PC Store AI Assistant (Claude)",
    gradientFrom: "emerald-600",
    gradientTo: "teal-500",
    apiRoute: "/api/ai-assistant/claude",
    provider: "Anthropic"
  },
  {
    name: "PC Store AI Assistant (Gemini)",
    gradientFrom: "amber-600",
    gradientTo: "orange-500",
    apiRoute: "/api/ai-assistant/gemini",
    provider: "Google"
  },
  {
    name: "PC Store AI Assistant (Llama)",
    gradientFrom: "rose-600",
    gradientTo: "red-500",
    apiRoute: "/api/ai-assistant/llama",
    provider: "Meta"
  }
];