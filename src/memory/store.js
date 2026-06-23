import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export class MemoryStore {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.lucianDir = join(projectPath, ".lucian");
    this.contextFile = join(this.lucianDir, "context.json");
    this.reset();
  }

  reset() {
    this.state = {
      lastGoal: null,
      lastPlan: null,
      executedSteps: [],
      preferences: {},
      conversationHistory: [],
    };
  }

  load() {
    try {
      if (existsSync(this.contextFile)) {
        const data = readFileSync(this.contextFile, "utf-8");
        const loaded = JSON.parse(data);
        this.state = { ...this.state, ...loaded };
        return true;
      }
    } catch (error) {
      console.log(`[WARNING] Could not load context: ${error.message}`);
    }
    return false;
  }

  save() {
    try {
      // Criar diretório .lucian se não existir
      if (!existsSync(this.lucianDir)) {
        mkdirSync(this.lucianDir, { recursive: true });
      }

      // Salvar contexto
      writeFileSync(
        this.contextFile,
        JSON.stringify(this.state, null, 2),
        "utf-8",
      );
      return true;
    } catch (error) {
      console.log(`[WARNING] Could not save context: ${error.message}`);
      return false;
    }
  }

  update(key, value) {
    if (this.state.hasOwnProperty(key)) {
      this.state[key] = value;
      this.save(); // Salvar automaticamente após atualização
    }
  }

  addToHistory(message) {
    this.state.conversationHistory.push(message);
    this.save();
  }

  getSummary() {
    return {
      goal: this.state.lastGoal || "None",
      planSteps: this.state.lastPlan ? this.state.lastPlan.length : 0,
      executedCount: this.state.executedSteps.length,
      historyLength: this.state.conversationHistory.length,
    };
  }
}
