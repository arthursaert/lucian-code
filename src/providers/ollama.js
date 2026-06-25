import { BaseProvider } from "./base.js";
import { Logger } from "../utils/logger.js";

export class OllamaProvider extends BaseProvider {
  constructor(baseUrl, model = "llama3.2") {
    super();
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.activeModel = model;
    this.fallbackModel = null;
  }

  // novo metodo de colocar modelo
  setModel(model) {
    this.activeModel = model;
    console.log(`[Ollama] Model set to: ${model}`);
  }

  // adicionar metodo setFallback
  setFallback(model) {
    this.fallbackModel = model;
    console.log(`[Ollama] Fallback model set to: ${model}`);
  }

  async complete(messages, tools = null, modelOverride = null) {
    const model = modelOverride || this.activeModel;

    // formatar mensagens para o formato do ollama
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const requestBody = {
      model: model,
      messages: formattedMessages,
      stream: false,
      options: {
        temperature: 0.7,
      }
    };

    try {
      // usar endpoint nativo do llama
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      // formatar resposta para o formato esperado pelo agente
      return {
        role: "assistant",
        content: data.message?.content || "No response generated",
        tool_calls: null
      };
    } catch (error) {
      Logger.error(`Ollama request failed: ${error.message}`);
      throw error;
    }
  }
}