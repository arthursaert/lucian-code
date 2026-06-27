export const CONFIG = {
  DEFAULT_MODEL: "qwen/qwen3.7-plus",
  FALLBACK_MODEL: "openai/gpt-4o-mini",

  MARITACA_DEFAULT_MODEL: "sabiazinho-4",
  MARITACA_FALLBACK_MODEL: "sabia-4",

  OLLAMA_DEFAULT_MODEL: "llama3.2",
  OLLAMA_FALLBACK_MODEL: null,

  GROQ_DEFAULT_MODEL: "llama-3.3-70b-versatile",
  GROQ_FALLBACK_MODEL: "llama-3.1-8b-instant",

  PROVIDERS: {
    OPENROUTER: "openrouter",
    MARITACA: "maritaca",
    OLLAMA: "ollama",
    GROQ: "groq",
  },

  MODES: {
    CHAT: "CHAT",
    PLAN: "PLAN",
    BUILD: "BUILD",
  },
};
