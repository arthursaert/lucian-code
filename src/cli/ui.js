export function renderStatus(state) {
  console.log("[Lucian Code]");
  console.log(`Provider:          ${state.providerName}`);
  console.log(`Mode:              ${state.mode}`);
  console.log(`Active Model:      ${state.model}`);
  console.log(`Fallback Model:    ${state.fallbackModel || "Not set"}`);
  console.log(`Memory Goal:       ${state.memorySummary.goal}`);
  console.log(`Plan Steps:        ${state.memorySummary.planSteps}`);
  console.log(`Executed Steps:    ${state.memorySummary.executedCount}\n`);
}

export function printHelp() {
  console.log("Available Commands:");
  console.log("  /help                  - Display this help menu");
  console.log("  /plan                  - Switch to PLAN MODE");
  console.log("  /build                 - Switch to BUILD MODE");
  console.log("  /chat                  - Switch to CHAT MODE");
  console.log(
    "  /switch-provider <p>   - Switch active provider (openrouter, maritaca, ollama)",
  );
  console.log(
    "  /switch-model <m>      - Set active AI model (any model from current provider)",
  );
  console.log("  /set-fallback <m>      - Set fallback AI model");
  console.log("  /models                - Show current model configuration");
  console.log(
    "  /reset                 - Clear session memory and model preferences",
  );
  console.log("  /status                - Show current system status\n");
}
