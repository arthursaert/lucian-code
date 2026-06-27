import { CONFIG } from "../core/config.js";
import { printHelp, renderStatus } from "./ui.js";
import { OpenRouterProvider } from "../providers/openrouter.js";
import { MaritalkProvider } from "../providers/maritaca.js";
import { OllamaProvider } from "../providers/ollama.js";
import { GroqProvider } from "../providers/groq.js";

export function parseCommand(input, context) {
  const trimmed = input.trim();

  if (!trimmed.startsWith("/")) {
    return { type: "MESSAGE", payload: trimmed };
  }

  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(" ").trim();

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

    case "/switch-provider":
      if (!args) {
        console.log("Usage: /switch-provider <provider_name>");
        console.log("Available providers: openrouter, maritaca, ollama, groq");
        console.log("Example: /switch-provider groq\n");
      } else {
        const providerName = args.toLowerCase();

        if (!Object.values(CONFIG.PROVIDERS).includes(providerName)) {
          console.log(`Unknown provider: ${providerName}`);
          console.log(
            "Available providers: openrouter, maritaca, ollama, groq\n",
          );
          return { type: "SYSTEM", payload: null };
        }

        try {
          let newProvider;

          switch (providerName) {
            case CONFIG.PROVIDERS.OPENROUTER:
              if (!process.env.OPENROUTER_API_KEY) {
                console.log(
                  "[ERROR] OPENROUTER_API_KEY environment variable is not set.\n",
                );
                return { type: "SYSTEM", payload: null };
              }
              newProvider = new OpenRouterProvider(
                process.env.OPENROUTER_API_KEY,
                CONFIG.DEFAULT_MODEL,
                CONFIG.FALLBACK_MODEL,
              );
              break;

            case CONFIG.PROVIDERS.MARITACA:
              if (!process.env.MARITACA_API_KEY) {
                console.log(
                  "[ERROR] MARITACA_API_KEY environment variable is not set.\n",
                );
                return { type: "SYSTEM", payload: null };
              }
              newProvider = new MaritalkProvider(
                process.env.MARITACA_API_KEY,
                CONFIG.MARITACA_DEFAULT_MODEL || "sabiazinho-4",
              );
              break;

            case CONFIG.PROVIDERS.OLLAMA:
              const ollamaUrl =
                process.env.MODEL_LOCALHOST_URL || "http://localhost:11434";
              newProvider = new OllamaProvider(
                ollamaUrl,
                CONFIG.OLLAMA_DEFAULT_MODEL || "llama3",
              );
              break;

            case CONFIG.PROVIDERS.GROQ:
              if (!process.env.GROQ_API_KEY) {
                console.log(
                  "[ERROR] GROQ_API_KEY environment variable is not set.\n",
                );
                return { type: "SYSTEM", payload: null };
              }
              newProvider = new GroqProvider(
                process.env.GROQ_API_KEY,
                CONFIG.GROQ_DEFAULT_MODEL,
              );
              break;
          }

          context.provider = newProvider;
          context.providerName = providerName;
          context.model = newProvider.activeModel;
          console.log(`Provider switched to: ${providerName}`);
          console.log(`Active model: ${context.model}\n`);
        } catch (error) {
          console.log(`[ERROR] Failed to switch provider: ${error.message}\n`);
        }
      }
      return { type: "SYSTEM", payload: null };

    case "/switch-model":
      if (!args) {
        console.log("Usage: /switch-model <model_name>");
        console.log("Example: /switch-model anthropic/claude-3.5-sonnet\n");
      } else {
        try {
          context.provider.setModel(args);
          context.model = args;
          context.memory.update("preferredModel", args);
          console.log(`Active model set to: ${args}`);
          console.log(
            "Note: Model validity will be confirmed on next request.\n",
          );
        } catch (error) {
          console.log(`[ERROR] ${error.message}\n`);
        }
      }
      return { type: "SYSTEM", payload: null };

    case "/set-fallback":
      if (!args) {
        console.log("Usage: /set-fallback <model_name>");
        console.log("Example: /set-fallback openai/gpt-4o-mini\n");
      } else {
        context.provider.setFallback(args);
        context.fallbackModel = args;
        context.memory.update("preferredFallback", args);
        console.log(`Fallback model set to: ${args}\n`);
      }
      return { type: "SYSTEM", payload: null };

    case "/models":
      console.log(`Current Provider:  ${context.providerName}`);
      console.log(`Active Model:      ${context.model}`);
      console.log(`Fallback Model:    ${context.fallbackModel || "Not set"}`);
      console.log("\nAvailable providers: openrouter, maritaca, ollama\n");
      return { type: "SYSTEM", payload: null };

    case "/reset":
      context.memory.reset();
      context.memory.save();
      console.log("Session memory cleared.\n");
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
