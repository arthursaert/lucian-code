#!/usr/bin/env node

import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { CONFIG } from "./core/config.js";
import { Agent } from "./agent/core.js";
import { parseCommand } from "./cli/commands.js";
import { printBanner } from "./cli/ui.js";
import { MemoryStore } from "./memory/store.js";
import { OpenRouterProvider } from "./providers/openrouter.js";
import { MaritalkProvider } from "./providers/maritaca.js";
import { OllamaProvider } from "./providers/ollama.js";

async function main() {
  printBanner();

  let provider;
  let providerName;

  if (process.env.MARITACA_API_KEY) {
    providerName = CONFIG.PROVIDERS.MARITACA;
    provider = new MaritalkProvider(
      process.env.MARITACA_API_KEY,
      CONFIG.MARITACA_DEFAULT_MODEL || "sabiazinho-4",
    );
  } else if (process.env.MODEL_LOCALHOST_URL) {
    providerName = CONFIG.PROVIDERS.OLLAMA;
    provider = new OllamaProvider(
      process.env.MODEL_LOCALHOST_URL,
      CONFIG.OLLAMA_DEFAULT_MODEL || "llama3",
    );
  } else if (process.env.OPENROUTER_API_KEY) {
    providerName = CONFIG.PROVIDERS.OPENROUTER;
    provider = new OpenRouterProvider(
      process.env.OPENROUTER_API_KEY,
      CONFIG.DEFAULT_MODEL,
      CONFIG.FALLBACK_MODEL,
    );
  } else {
    console.error("[ERROR] No provider API key found.");
    console.error(
      "Please set one of: OPENROUTER_API_KEY, MARITACA_API_KEY, or MODEL_LOCALHOST_URL",
    );
    process.exit(1);
  }

  const memory = new MemoryStore();

  const loaded = memory.load();
  if (loaded) {
    console.log("[INFO] Context loaded from .lucian/context.json");
  } else {
    console.log(
      "[INFO] Starting new session. Context will be saved in .lucian/",
    );
  }

  const context = {
    providerName: providerName,
    mode: CONFIG.MODES.CHAT,
    model: provider.activeModel,
    fallbackModel: provider.fallbackModel,
    provider: provider,
    memory: memory,
    get memorySummary() {
      return this.memory.getSummary();
    },
  };

  const agent = new Agent(provider, memory, context);
  context.agent = agent;

  const rl = createInterface({ input: stdin, output: stdout });

  console.log(`System initialized with ${providerName} provider.`);
  console.log("Type /help for commands.\n");

  while (true) {
    const input = await rl.question("lucian> ");

    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log("Exiting Lucian Code.");
      memory.save();
      rl.close();
      process.exit(0);
    }

    const parsed = parseCommand(input, context);

    if (parsed.type === "MESSAGE" && parsed.payload) {
      await agent.processInput(parsed.payload);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
