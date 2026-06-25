import { BaseProvider } from "./base.js";
import { Logger } from "../utils/logger.js";

export class OllamaProvider extends BaseProvider {
  constructor(baseUrl, model = "llama3.2") {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.activeModel = model;
    this.fallbackModel = null;
  }

  setModel(model) {
    this.activeModel = model;
    console.log(`[Ollama] Model set to: ${model}`);
  }

  setFallback(model) {
    this.fallbackModel = model;
    console.log(`[Ollama] Fallback model set to: ${model}`);
  }

  async complete(messages, tools = null, modelOverride = null) {
    const model = modelOverride || this.activeModel;

    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const requestBody = {
      model: model,
      messages: formattedMessages,
      stream: false,
      options: {
        temperature: 0.7,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      return {
        role: "assistant",
        content: data.message?.content || "No response generated",
        tool_calls: null,
      };
    } catch (error) {
      Logger.error(`Ollama request failed: ${error.message}`);
      throw error;
    }
  }

  async completeStream(messages) {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const requestBody = {
      model: this.activeModel,
      messages: formattedMessages,
      stream: true,
      options: {
        temperature: 0.7,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      return await this.processNDJSONStream(response);
    } catch (error) {
      Logger.error(`Ollama streaming failed: ${error.message}`);
      throw error;
    }
  }

  async processNDJSONStream(response) {
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
        if (!trimmed) continue;

        try {
          const parsed = JSON.parse(trimmed);

          if (parsed.message?.content) {
            process.stdout.write(parsed.message.content);
            fullContent += parsed.message.content;
          }

          if (parsed.done) {
            break;
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
