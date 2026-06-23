import { CONFIG } from "../core/config.js";
import { printHelp, renderStatus } from "./ui.js";
import { OpenRouterProvider } from "../providers/openrouter.js";
import { OllamaProvider } from "../providers/ollama.js";
import { MaritalkProvider, MARITALK_MODELS } from "../providers/maritalk.js";

export function parseCommand(input, context) {
  const trimmed = input.trim();

  if (!trimmed.startsWith("/")) {
    return { type: "MESSAGE", payload: trimmed };
  }

  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch (command) {
    case "/help":
      printHelp();
      return { type: "SYSTEM", payload: null };

    case "/plan":
      context.mode = CONFIG.MODES.PLAN;
      console.log("Switched to PLAN MODE.\n");
      return { type: "SYSTEM", payload: null };

    case "/build":
      context.mode = CONFIG.MODES.BUILD;
      console.log("Switched to BUILD MODE.\n");
      return { type: "SYSTEM", payload: null };

    case "/chat":
      context.mode = CONFIG.MODES.CHAT;
      console.log("Switched to CHAT MODE.\n");
      return { type: "SYSTEM", payload: null };

    case "/switch-model":
      if (!args[0]) {
        console.log("Usage: /switch-model <model_name>\n");
      } else {
        context.provider.setModel(args[0]);
        context.model = args[0];
        console.log(`Model switched to: ${args[0]}\n`);
      }
      return { type: "SYSTEM", payload: null };

    case "/set-fallback":
      if (!args[0]) {
        console.log("Usage: /set-fallback <model_name>\n");
      } else {
        context.provider.setFallback(args[0]);
        console.log(`Fallback model set to: ${args[0]}\n`);
      }
      return { type: "SYSTEM", payload: null };

    case "/models":
      console.log(`Active Model:   ${context.model}`);
      console.log(`Fallback Model: ${context.provider.fallbackModel}\n`);
      return { type: "SYSTEM", payload: null };

    case "/provider":
      handleProvider(args, context);
      return { type: "SYSTEM", payload: null };

    case "/reset":
      context.memory.reset();
      if (context.agent) context.agent.clearHistory();
      console.log("Session memory and conversation history cleared.\n");
      return { type: "SYSTEM", payload: null };

    case "/status":
      renderStatus(context);
      return { type: "SYSTEM", payload: null };

    default:
      console.log(
        `Unknown command: ${command}. Type /help for available commands.\n`,
      );
      return { type: "SYSTEM", payload: null };
  }
}

function handleProvider(args, context) {
  // /provider with no args → show current
  if (!args[0]) {
    console.log(`Current Provider: ${context.providerName}`);
    console.log(`Active Model:     ${context.model}`);
    console.log(`Fallback Model:   ${context.provider.fallbackModel ?? "none"}`);
    console.log(
      "\nAvailable providers: openrouter, ollama, maritalk\n",
    );
    return;
  }

  const target = args[0].toLowerCase();

  switch (target) {
    case CONFIG.PROVIDERS.OPENROUTER: {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        console.log(
          "[ERROR] OPENROUTER_API_KEY is not set in environment.\n",
        );
        return;
      }
      const provider = new OpenRouterProvider(
        apiKey,
        CONFIG.DEFAULT_MODEL,
        CONFIG.FALLBACK_MODEL,
      );
      context.provider = provider;
      context.providerName = CONFIG.PROVIDERS.OPENROUTER;
      context.model = CONFIG.DEFAULT_MODEL;
      console.log(`Switched to OpenRouter. Model: ${CONFIG.DEFAULT_MODEL}\n`);
      break;
    }

    case CONFIG.PROVIDERS.OLLAMA: {
      const baseUrl = process.env.MODEL_LOCALHOST_URL;
      if (!baseUrl) {
        console.log(
          "[ERROR] MODEL_LOCALHOST_URL is not set in environment.\n",
        );
        return;
      }
      const model = args[1] || "llama3";
      const provider = new OllamaProvider(baseUrl, model);
      context.provider = provider;
      context.providerName = CONFIG.PROVIDERS.OLLAMA;
      context.model = model;
      console.log(`Switched to Ollama (${baseUrl}). Model: ${model}\n`);
      break;
    }

    case CONFIG.PROVIDERS.MARITALK: {
      const apiKey = process.env.MARITACA_API_KEY;
      if (!apiKey) {
        console.log(
          "[ERROR] MARITACA_API_KEY is not set in environment.\n",
        );
        return;
      }
      const model = args[1] || "sabiazinho-4";
      if (!MARITALK_MODELS.includes(model)) {
        console.log(
          `[ERROR] Invalid MariTalk model: '${model}'.\nAvailable: ${MARITALK_MODELS.join(", ")}\n`,
        );
        return;
      }
      const provider = new MaritalkProvider(apiKey, model);
      context.provider = provider;
      context.providerName = CONFIG.PROVIDERS.MARITALK;
      context.model = model;
      console.log(`Switched to MariTalk. Model: ${model}\n`);
      break;
    }

    default:
      console.log(
        `[ERROR] Unknown provider: '${target}'.\nAvailable: openrouter, ollama, maritalk\n`,
      );
  }
}
