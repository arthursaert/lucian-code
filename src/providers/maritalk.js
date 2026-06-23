import { BaseProvider } from "./base.js";
import { Logger } from "../utils/logger.js";

export const MARITALK_MODELS = ["sabiazinho-4", "sabia-4"];
const MARITALK_BASE_URL = "https://chat.maritaca.ai/api";

export class MaritalkProvider extends BaseProvider {
  constructor(apiKey, model = "sabiazinho-4") {
    super();
    this.apiKey = apiKey;
    this.activeModel = model;
    // Default fallback: the other available model
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
}
