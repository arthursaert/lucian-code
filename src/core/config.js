export const CONFIG = {
  DEFAULT_MODEL: "qwen/qwen3.7-plus",
  FALLBACK_MODEL: "openai/gpt-4o-mini",

  MARITACA_DEFAULT_MODEL: "sabia-3",
  MARITACA_FALLBACK_MODEL: "sabia-2-medium",

  OLLAMA_DEFAULT_MODEL: "llama2",
  OLLAMA_FALLBACK_MODEL: "mistral",

  PROVIDERS: {
    OPENROUTER: "openrouter",
    MARITACA: "maritaca",
    OLLAMA: "ollama",
  },

  MODES: {
    CHAT: "CHAT",
    PLAN: "PLAN",
    BUILD: "BUILD",
  },
};
