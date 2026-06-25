import { BaseProvider } from "./base.js";
import { Logger } from "../utils/logger.js";

export class OpenRouterProvider extends BaseProvider {
  constructor(apiKey, defaultModel, fallbackModel) {
    super();
    this.apiKey = apiKey;
    this.defaultModel = defaultModel;
    this.fallbackModel = fallbackModel;
    this.activeModel = defaultModel;
    this.useFallback = false;
  }

  setModel(model) {
    this.activeModel = model;
    this.useFallback = false;
  }

  setFallback(model) {
    this.fallbackModel = model;
  }

  forceFallback() {
    this.useFallback = true;
  }

  async complete(messages, tools = null, modelOverride = null) {
    if (this.useFallback) {
      return this.executeFallback(messages, tools);
    }

    const model = modelOverride || this.activeModel;

    try {
      const requestBody = {
        model: model,
        messages: messages,
        stream: false,
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
      Logger.info("Switching to fallback model for this session...");
      this.useFallback = true;
      return this.executeFallback(messages, tools);
    }
  }

  async completeStream(messages) {
    if (this.useFallback) {
      return this.executeFallbackStream(messages);
    }

    try {
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
          body: JSON.stringify({
            model: this.activeModel,
            messages: messages,
            stream: true,
          }),
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
          throw new ModelNotFoundError(this.activeModel, errorMessage);
        }

        throw new Error(`API request failed: ${errorMessage}`);
      }

      return await this.processSSEStream(response);
    } catch (error) {
      if (error instanceof ModelNotFoundError) {
        throw error;
      }

      Logger.error(
        `Primary model ${this.activeModel} failed: ${error.message}`,
      );
      Logger.info("Switching to fallback model for this session...");
      this.useFallback = true;
      return this.executeFallbackStream(messages);
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

  async executeFallback(messages, tools = null) {
    try {
      const requestBody = {
        model: this.fallbackModel,
        messages: messages,
        stream: false,
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

  async executeFallbackStream(messages) {
    try {
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
          body: JSON.stringify({
            model: this.fallbackModel,
            messages: messages,
            stream: true,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Fallback request failed with status ${response.status}`,
        );
      }

      return await this.processSSEStream(response);
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
