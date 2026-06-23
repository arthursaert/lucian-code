import { BaseProvider } from "./base.js";
import { Logger } from "../utils/logger.js";

export class OllamaProvider extends BaseProvider {
  constructor(baseUrl, model = "llama3") {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.activeModel = model;
    this.fallbackModel = null;
  }

  setModel(model) {
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
      stream: false,
    };

    if (tools && tools.length > 0) {
      requestBody.tools = tools;
      requestBody.tool_choice = "auto";
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices returned from Ollama");
      }

      return data.choices[0].message;
    } catch (error) {
      Logger.error(`Ollama request failed: ${error.message}`);
      throw error;
    }
  }
}
