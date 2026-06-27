import { BaseProvider } from "./base.js";
import { Logger } from "../utils/logger.js";

export const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "mixtral-8x7b-32768",
  "gemma2-9b-it",
  "deepseek-r1-distill-llama-70b",
];

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export class GroqProvider extends BaseProvider {
  constructor(apiKey, model = "llama-3.3-70b-versatile") {
    super();
    this.apiKey = apiKey;
    this.activeModel = model;
    this.fallbackModel =
      GROQ_MODELS.find((m) => m !== model) ?? "llama-3.1-8b-instant";
    this.useFallback = false;
    console.log(`[Groq] Initialized with model: ${model}`);
  }

  setModel(model) {
    this.activeModel = model;
    this.useFallback = false;
    console.log(`[Groq] Model set to: ${model}`);
  }

  setFallback(model) {
    this.fallbackModel = model;
    console.log(`[Groq] Fallback model set to: ${model}`);
  }

  forceFallback() {
    this.useFallback = true;
  }

  async complete(messages, tools = null, modelOverride = null) {
    if (this.useFallback) {
      return this.executeFallback(messages, tools);
    }

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
      const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
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

        if (response.status === 404 || response.status === 400) {
          throw new GroqModelNotFoundError(model, errorMessage);
        }

        throw new Error(`Groq request failed: ${errorMessage}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices returned from Groq");
      }

      return data.choices[0].message;
    } catch (error) {
      if (error instanceof GroqModelNotFoundError) {
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
      const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.activeModel,
          messages,
          stream: true,
        }),
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

        if (response.status === 404 || response.status === 400) {
          throw new GroqModelNotFoundError(this.activeModel, errorMessage);
        }

        throw new Error(`Groq streaming failed: ${errorMessage}`);
      }

      return await this.processSSEStream(response);
    } catch (error) {
      if (error instanceof GroqModelNotFoundError) {
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
        messages,
        stream: false,
      };

      if (tools && tools.length > 0) {
        requestBody.tools = tools;
        requestBody.tool_choice = "auto";
      }

      const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq fallback request failed: ${errorBody}`);
      }

      const data = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No response choices returned from Groq fallback");
      }

      return data.choices[0].message;
    } catch (error) {
      Logger.error(`Groq fallback failed: ${error.message}`);
      throw error;
    }
  }

  async executeFallbackStream(messages) {
    try {
      const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.fallbackModel,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Groq fallback streaming failed: HTTP ${response.status}`,
        );
      }

      return await this.processSSEStream(response);
    } catch (error) {
      Logger.error(`Groq fallback streaming failed: ${error.message}`);
      throw error;
    }
  }
}

export class GroqModelNotFoundError extends Error {
  constructor(model, message) {
    super(message);
    this.name = "GroqModelNotFoundError";
    this.model = model;
  }
}
