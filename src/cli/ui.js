import { CONFIG } from "../core/config.js";

export function printBanner() {
  const banner = `
 ___       ___  ___  ________  ___  ________  ________           ________  ________  ________  _______   
|\\  \\     |\\  \\|\\  \\|\\   ____\\|\\  \\|\\   __  \\|\\   ___  \\        |\\   ____\\|\\   __  \\|\\   ___ \\|\\  ___ \\  
\\ \\  \\    \\ \\  \\\\\\  \\ \\  \\___|\\ \\  \\ \\  \\|\\  \\ \\  \\\\ \\  \\       \\ \\  \\___|\\ \\  \\|\\  \\ \\  \\_|\\ \\ \\   __/| 
 \\ \\  \\    \\ \\  \\\\\\  \\ \\  \\    \\ \\  \\ \\   __  \\ \\  \\\\ \\  \\       \\ \\  \\    \\ \\  \\\\\\  \\ \\  \\ \\\\ \\ \\  \\_|/__
  \\ \\  \\____\\ \\  \\\\\\  \\ \\  \\____\\ \\  \\ \\  \\ \\  \\ \\  \\\\ \\  \\       \\ \\  \\____\\ \\  \\\\\\  \\ \\  \\_\\\\ \\ \\  \\_|\\ \\
   \\ \\_______\\ \\_______\\ \\_______\\ \\__\\ \\__\\ \\__\\ \\__\\\\ \\__\\       \\ \\_______\\ \\_______\\ \\_______\\ \\_______\\
    \\|_______|\\|_______|\\|_______|\\|__|\\|__|\\|__|\\|__| \\|__|        \\|_______|\\|_______|\\|_______|\\|_______|
  `;
  console.log(banner);
  console.log("Lucian Code - Open Agentic Coding System\n");
}

export function renderStatus(state) {
  console.log("[Lucian Code]");
  console.log(`Mode:            ${state.mode}`);
  console.log(`Active Model:    ${state.model}`);
  console.log(`Fallback Model:  ${state.provider.fallbackModel}`); // Fix #4: was state.fallbackModel
  console.log(`Memory Goal:     ${state.memorySummary.goal}`);
  console.log(`Plan Steps:      ${state.memorySummary.planSteps}`);
  console.log(`Executed Steps:  ${state.memorySummary.executedCount}\n`);
}

export function printHelp() {
  console.log("Available Commands:");
  console.log("  /help               - Display this help menu");
  console.log("  /plan               - Switch to PLAN MODE");
  console.log("  /build              - Switch to BUILD MODE");
  console.log("  /chat               - Switch to CHAT MODE");
  console.log(
    "  /switch-model <m>   - Set active AI model (any OpenRouter model)",
  );
  console.log("  /set-fallback <m>   - Set fallback AI model");
  console.log("  /models             - Show current model configuration");
  console.log(
    "  /reset              - Clear session memory and conversation history",
  );
  console.log("  /status             - Show current system status\n");
}
