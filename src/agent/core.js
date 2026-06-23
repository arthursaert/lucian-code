import { Logger } from "../utils/logger.js";
import { getSystemPrompt } from "./modes.js";
import { ModelNotFoundError } from "../providers/openrouter.js";
import { ToolExecutor, TOOL_DEFINITIONS } from "./tools.js";

export class Agent {
  constructor(provider, memory, context) {
    this.provider = provider;
    this.memory = memory;
    this.context = context;
    this.toolExecutor = new ToolExecutor();
    this.maxIterations = 10; // Prevent infinite loops
  }

  async processInput(userInput) {
    Logger.agent("INPUT", "Received");
    Logger.agent("ANALYZE", "Processing context");

    const systemPrompt = getSystemPrompt(this.context.mode);

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userInput },
    ];

    // Em BUILD MODE, usar tools
    const useTools = this.context.mode === "BUILD";
    const tools = useTools ? TOOL_DEFINITIONS : null;

    Logger.agent("PLAN", "Generating response via LLM");

    try {
      let iteration = 0;
      let finalResponse = null;

      // Loop de tool calling (apenas em BUILD MODE)
      while (iteration < this.maxIterations) {
        iteration++;

        const response = await this.provider.complete(messages, tools);

        // Se o modelo quer chamar uma tool (e estamos usando tools)
        if (useTools && response.tool_calls && response.tool_calls.length > 0) {
          // Adicionar a resposta do assistente ao histórico
          messages.push(response);

          // Executar cada tool call
          for (const toolCall of response.tool_calls) {
            console.log(`\n[Tool Call] ${toolCall.function.name}`);

            try {
              const params = JSON.parse(toolCall.function.arguments);
              console.log(`Parameters: ${JSON.stringify(params, null, 2)}`);

              const result = await this.toolExecutor.execute(
                toolCall.function.name,
                params,
              );

              console.log(`Result: ${result.message || "Success"}`);

              // Adicionar resultado ao histórico
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(result),
              });

              // Registrar na memória
              this.memory.state.executedSteps.push({
                tool: toolCall.function.name,
                params: params,
                result: result,
                timestamp: new Date().toISOString(),
              });
            } catch (error) {
              console.log(`Error: ${error.message}`);

              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: error.message }),
              });
            }
          }

          // Continuar o loop para o modelo processar os resultados
          continue;
        }

        // Se não há tool calls, o modelo terminou
        finalResponse = response.content;
        break;
      }

      if (iteration >= this.maxIterations) {
        console.log(
          "\n[WARNING] Maximum iterations reached. Stopping execution.",
        );
      }

      // Exibir resposta final
      if (finalResponse) {
        Logger.agent("OUTPUT", "Rendering result");
        console.log("\n--- Agent Output ---");
        console.log(finalResponse);
        console.log("--------------------\n");
      }

      // Atualizar memória
      if (this.context.mode === "PLAN" || this.context.mode === "BUILD") {
        this.memory.update("lastGoal", userInput);
        this.memory.update("lastPlan", finalResponse || "Execution completed");
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  handleError(error) {
    console.log("");

    if (error instanceof ModelNotFoundError) {
      console.log(`[ERROR] Model '${error.model}' not found or invalid.`);
      console.log(`Reason: ${error.message}`);
      console.log("Browse available models at: https://openrouter.ai/models\n");
      return;
    }

    console.log("[ERROR] Failed to generate response from provider.");
    console.log(`Details: ${error.message}`);
    console.log("");
    console.log("Possible causes:");
    console.log("  - Invalid API key");
    console.log("  - Network connectivity issues");
    console.log("  - Rate limiting or quota exceeded");
    console.log("  - Model temporarily unavailable");
    console.log("");
    console.log("Verify your API key and try again.\n");
  }
}
