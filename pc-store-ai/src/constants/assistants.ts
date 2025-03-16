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
    gradientFrom: "indigo-700",
    gradientTo: "blue-600",
    apiRoute: "/api/ai-assistant/openai",
    provider: "OpenAI"
  },
  {
    name: "PC Store AI Assistant (GPT-4 + DB)",
    gradientFrom: "indigo-500",
    gradientTo: "blue-400",
    apiRoute: "/api/ai-assistant/openai-db",
    provider: "OpenAI"
  },
  {
    name: "PC Store AI Assistant (Copilot)",
    gradientFrom: "purple-700",
    gradientTo: "pink-600",
    apiRoute: "/api/ai-assistant/copilot",
    provider: "Microsoft"
  },
  {
    name: "PC Store AI Assistant (Copilot +DB)",
    gradientFrom: "purple-500",
    gradientTo: "pink-400",
    apiRoute: "/api/ai-assistant/copilot-db",
    provider: "Microsoft"
  },
  {
    name: "PC Store AI Assistant (Gemini)",
    gradientFrom: "orange-700",
    gradientTo: "yellow-600",
    apiRoute: "/api/ai-assistant/gemini",
    provider: "Google"
  },
  {
    name: "PC Store AI Assistant (Gemini + DB)",
    gradientFrom: "orange-500",
    gradientTo: "yellow-400",
    apiRoute: "/api/ai-assistant/gemini-db",
    provider: "Google"
  },
  {
    name: "PC Store AI Assistant (Deepseek)",
    gradientFrom: "emerald-700",
    gradientTo: "teal-600",
    apiRoute: "/api/ai-assistant/deepseek",
    provider: "Deepseek"
  },
  {
    name: "PC Store AI Assistant (Deepseek + DB)",
    gradientFrom: "emerald-500",
    gradientTo: "teal-400",
    apiRoute: "/api/ai-assistant/deepseek-db",
    provider: "Deepseek"
  },
];