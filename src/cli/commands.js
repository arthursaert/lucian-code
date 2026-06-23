import { CONFIG } from "../core/config.js";
import { printHelp, renderStatus } from "./ui.js";

export function parseCommand(input, context) {
  const trimmed = input.trim();

  if (!trimmed.startsWith("/")) {
    return { type: "MESSAGE", payload: trimmed };
  }

  const parts = trimmed.split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(" ");

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
      if (!args) {
        console.log("Usage: /switch-model <model_name>\n");
      } else {
        context.provider.setModel(args);
        context.model = args;
        console.log(`Model switched to: ${args}\n`);
      }
      return { type: "SYSTEM", payload: null };

    // Fix #3: implement missing /set-fallback command
    case "/set-fallback":
      if (!args) {
        console.log("Usage: /set-fallback <model_name>\n");
      } else {
        context.provider.setFallback(args);
        console.log(`Fallback model set to: ${args}\n`);
      }
      return { type: "SYSTEM", payload: null };

    // Fix #3: implement missing /models command
    case "/models":
      console.log(`Active Model:   ${context.model}`);
      console.log(`Fallback Model: ${context.provider.fallbackModel}\n`);
      return { type: "SYSTEM", payload: null };

    case "/reset":
      context.memory.reset();
      // Fix #1: also clear conversation history on reset
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
