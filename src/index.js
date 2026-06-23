#!/usr/bin/env node

import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { CONFIG } from "./core/config.js";
import { Agent } from "./agent/core.js";
import { parseCommand } from "./cli/commands.js";
import { printBanner } from "./cli/ui.js";
import { MemoryStore } from "./memory/store.js";
import { OpenRouterProvider } from "./providers/openrouter.js";

async function main() {
  printBanner();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error(
      "[ERROR] OPENROUTER_API_KEY environment variable is not set.",
    );
    console.error(
      "Please set it in your .env file or export it in your terminal.",
    );
    process.exit(1);
  }

  const memory = new MemoryStore();
  const provider = new OpenRouterProvider(
    apiKey,
    CONFIG.DEFAULT_MODEL,
    CONFIG.FALLBACK_MODEL,
  );

  const context = {
    mode: CONFIG.MODES.CHAT,
    model: CONFIG.DEFAULT_MODEL,
    provider: provider,
    memory: memory,
    get memorySummary() {
      return this.memory.getSummary();
    },
  };

  const agent = new Agent(provider, memory, context);
  context.agent = agent; // Fix #1: expose agent on context so /reset can clear history

  const rl = createInterface({ input: stdin, output: stdout });

  console.log("System initialized. Type /help for commands.\n");

  while (true) {
    const input = await rl.question("lucian> ");

    if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
      console.log("Exiting Lucian Code.");
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
