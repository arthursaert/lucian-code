import { BaseProvider } from "./base.js";
import { Logger } from "../utils/logger.js";

export class OpenRouterProvider extends BaseProvider {
  constructor(apiKey, defaultModel, fallbackModel) {
    super();
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    this.fallbackModel = fallbackModel;
    this.activeModel = defaultModel;
  }

  setModel(model) {
    this.activeModel = model;
  }

  setFallback(model) {
    this.fallbackModel = model;
  }

  async complete(messages, tools = null, modelOverride = null) {
    const model = modelOverride || this.activeModel;

    try {
      const requestBody = {
        model: model,
        messages: messages,
      };

      // Adicionar tools se fornecidas
      if (tools && tools.length > 0) {
        requestBody.tools = tools;
        requestBody.tool_choice = "auto";
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/lucian-code",
            "X-OpenRouter-Title": "Lucian Code",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.error?.message || errorBody;
        } catch {
          errorMessage = errorBody || errorMessage;
        }

        if (response.status === 404 || response.status === 400) {
          throw new ModelNotFoundError(model, errorMessage);
        }

        throw new Error(`API request failed: ${errorMessage}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices returned from API");
      }

      return data.choices[0].message;
    } catch (error) {
      if (error instanceof ModelNotFoundError) {
        throw error;
      }

      Logger.error(`Primary model ${model} failed: ${error.message}`);
      Logger.info("Attempting fallback model...");
      return this.executeFallback(messages, tools);
    }
  }

  async executeFallback(messages, tools = null) {
    try {
      const requestBody = {
        model: this.fallbackModel,
        messages: messages,
      };

      if (tools && tools.length > 0) {
        requestBody.tools = tools;
        requestBody.tool_choice = "auto";
      }

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/lucian-code",
            "X-OpenRouter-Title": "Lucian Code",
          },
          body: JSON.stringify(requestBody),
        },
      );

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorJson = JSON.parse(errorBody);
          errorMessage = errorJson.error?.message || errorBody;
        } catch {
          errorMessage = errorBody || errorMessage;
        }

        throw new Error(`Fallback request failed: ${errorMessage}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices returned from fallback API");
      }

      return data.choices[0].message;
    } catch (error) {
      Logger.error(`Fallback model failed: ${error.message}`);
      throw error;
    }
  }
}

export class ModelNotFoundError extends Error {
  constructor(model, message) {
    super(message);
    this.name = "ModelNotFoundError";
    this.model = model;
  }
}
