import { BaseProvider } from "./base.js";
import { Logger } from "../utils/logger.js";

export const MARITALK_MODELS = ["sabiazinho-4", "sabia-4"];
const MARITALK_BASE_URL = "https://chat.maritaca.ai/api";

export class MaritalkProvider extends BaseProvider {
  constructor(apiKey, model = "sabiazinho-4") {
    super();
    this.apiKey = apiKey;
    this.activeModel = model;
    this.fallbackModel = MARITALK_MODELS.find((m) => m !== model) ?? null;
  }

  setModel(model) {
    if (!MARITALK_MODELS.includes(model)) {
      throw new Error(
        `Invalid MariTalk model: '${model}'. Available: ${MARITALK_MODELS.join(", ")}`,
      );
    }
    this.activeModel = model;
  }

  setFallback(model) {
    this.fallbackModel = model;
  }

  async complete(messages, tools = null, modelOverride = null) {
    const model = modelOverride || this.activeModel;

    const requestBody = {
      model,
      messages,
    };

    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = "auto";
    }

    try {
      const response = await fetch(`${MARITALK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.error?.message || errorBody;
        } catch {
          errorMessage = errorBody || errorMessage;
        }

        throw new Error(`MariTalk request failed: ${errorMessage}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices returned from MariTalk");
      }

      return data.choices[0].message;
    } catch (error) {
      Logger.error(`MariTalk request failed: ${error.message}`);
      throw error;
    }
  }

  async completeStream(messages) {
    const requestBody = {
      model: this.activeModel,
      messages,
      stream: true,
    };

    try {
      const response = await fetch(`${MARITALK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `MariTalk streaming failed: HTTP ${response.status}: ${errorBody}`,
        );
      }

      return await this.processSSEStream(response);
    } catch (error) {
      Logger.error(`MariTalk streaming failed: ${error.message}`);
      throw error;
    }
  }

  async processSSEStream(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;

          if (delta?.content) {
            process.stdout.write(delta.content);
            fullContent += delta.content;
          }
        } catch {
          // Ignorar linhas malformadas
        }
      }
    }

    process.stdout.write("\n");

    return {
      role: "assistant",
      content: fullContent,
    };
  }
}
