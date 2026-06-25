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
    this.maxIterations = 10;
  }

  async processInput(userInput) {
    Logger.agent("INPUT", "Received");
    Logger.agent("ANALYZE", "Processing context");

    const systemPrompt = getSystemPrompt(this.context.mode);

    this.memory.addToHistory({ role: "user", content: userInput });

    const messages = [
      { role: "system", content: systemPrompt },
      ...this.memory.state.conversationHistory,
    ];

    const useTools = this.context.mode === "BUILD";
    const useStreaming =
      !useTools && typeof this.provider.completeStream === "function";

    Logger.agent("PLAN", "Generating response via LLM");

    try {
      if (useStreaming) {
        console.log("\n--- Agent Output ---");
        const message = await this.provider.completeStream(messages);
        console.log("--------------------\n");

        this.memory.addToHistory(message);

        if (this.context.mode === "PLAN") {
          this.memory.update("lastGoal", userInput);
          this.memory.update("lastPlan", message.content);
        }
      } else {
        const tools = useTools ? TOOL_DEFINITIONS : null;
        let iteration = 0;
        let finalResponse = null;

        while (iteration < this.maxIterations) {
          iteration++;

          const response = await this.provider.complete(messages, tools);

          if (
            useTools &&
            response.tool_calls &&
            response.tool_calls.length > 0
          ) {
            messages.push(response);
            this.memory.addToHistory(response);

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

                const toolResult = {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify(result),
                };

                messages.push(toolResult);
                this.memory.addToHistory(toolResult);

                this.memory.state.executedSteps.push({
                  tool: toolCall.function.name,
                  params: params,
                  result: result,
                  timestamp: new Date().toISOString(),
                });
              } catch (error) {
                console.log(`Error: ${error.message}`);

                const toolError = {
                  role: "tool",
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({ error: error.message }),
                };

                messages.push(toolError);
                this.memory.addToHistory(toolError);
              }
            }

            continue;
          }

          finalResponse = response.content;

          this.memory.addToHistory({
            role: "assistant",
            content: finalResponse,
          });

          break;
        }

        if (iteration >= this.maxIterations) {
          console.log(
            "\n[WARNING] Maximum iterations reached. Stopping execution.",
          );
        }

        if (finalResponse) {
          Logger.agent("OUTPUT", "Rendering result");
          console.log("\n--- Agent Output ---");
          console.log(finalResponse);
          console.log("--------------------\n");
        }

        if (this.context.mode === "PLAN" || this.context.mode === "BUILD") {
          this.memory.update("lastGoal", userInput);
          this.memory.update(
            "lastPlan",
            finalResponse || "Execution completed",
          );
        }
      }
    } catch (error) {
      this.memory.state.conversationHistory.pop();
      this.memory.save();
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
